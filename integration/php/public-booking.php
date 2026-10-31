<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Vary: Origin');

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$configuredOrigins = getenv('BOOKING_ALLOWED_ORIGINS');
$allowedOrigins = $configuredOrigins === false || trim($configuredOrigins) === ''
    ? ['https://bone-barber-assistant.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:5173']
    : array_values(array_filter(array_map('trim', explode(',', $configuredOrigins))));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin === '' || !in_array($origin, $allowedOrigins, true)) {
    respond(403, ['ok' => false, 'message' => 'Asal permintaan tidak diizinkan.']);
}

header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 600');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST, OPTIONS');
    respond(405, ['ok' => false, 'message' => 'Metode permintaan tidak didukung.']);
}

date_default_timezone_set('Asia/Jakarta');
$configPath = null;
$searchDirectory = __DIR__;
for ($depth = 0; $depth < 6; $depth++) {
    $candidate = $searchDirectory . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php';
    if (is_file($candidate)) {
        $configPath = $candidate;
        break;
    }

    $parentDirectory = dirname($searchDirectory);
    if ($parentDirectory === $searchDirectory) {
        break;
    }
    $searchDirectory = $parentDirectory;
}

if ($configPath === null) {
    error_log('Konfigurasi situs admin tidak ditemukan untuk endpoint booking publik.');
    respond(500, ['ok' => false, 'message' => 'Layanan reservasi belum terhubung ke sistem admin.']);
}
require_once $configPath;

if ($method === 'GET') {
    if (($_GET['action'] ?? '') !== 'services') {
        respond(404, ['ok' => false, 'message' => 'Data yang diminta tidak tersedia.']);
    }

    try {
        $statement = $pdo->query("SELECT id_layanan AS id, nama_layanan AS name, harga AS price, durasi_menit AS duration FROM layanan WHERE status = 'aktif' ORDER BY nama_layanan ASC");
        respond(200, ['ok' => true, 'data' => $statement->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (Throwable $error) {
        error_log('Muat layanan booking publik gagal: ' . $error->getMessage());
        respond(500, ['ok' => false, 'message' => 'Daftar layanan belum dapat dimuat. Silakan coba kembali.']);
    }
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || strlen($rawBody) > 8192) {
    respond(413, ['ok' => false, 'message' => 'Ukuran permintaan terlalu besar.']);
}

$contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
if ($contentType !== 'application/json') {
    respond(415, ['ok' => false, 'message' => 'Format permintaan tidak didukung.']);
}

$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    respond(400, ['ok' => false, 'message' => 'Data reservasi tidak valid.']);
}

if (isset($payload['website']) && (!is_string($payload['website']) || $payload['website'] !== '')) {
    respond(400, ['ok' => false, 'message' => 'Permintaan tidak dapat diproses.']);
}

$clientAddress = $_SERVER['REMOTE_ADDR'] ?? '';
if ($clientAddress === '') {
    error_log('Booking publik ditolak: alamat klien tidak tersedia.');
    respond(503, ['ok' => false, 'message' => 'Layanan reservasi sedang tidak tersedia. Silakan coba kembali.']);
}

$ratePath = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'bone-booking-rate-limit.json';
$rateFile = @fopen($ratePath, 'c+');
if ($rateFile === false || !flock($rateFile, LOCK_EX)) {
    if (is_resource($rateFile)) {
        fclose($rateFile);
    }
    error_log('Rate limit booking publik tidak dapat dibuka.');
    respond(503, ['ok' => false, 'message' => 'Layanan reservasi sedang tidak tersedia. Silakan coba kembali.']);
}

$storedRequests = stream_get_contents($rateFile);
$requestsByClient = is_string($storedRequests) ? json_decode($storedRequests, true) : [];
$requestsByClient = is_array($requestsByClient) ? $requestsByClient : [];
$clientKey = hash('sha256', __FILE__ . '|' . $clientAddress);
$cutoff = time() - 600;
$requestTimes = $requestsByClient[$clientKey] ?? [];
$requestTimes = is_array($requestTimes) ? array_values(array_filter($requestTimes, static fn ($value) => is_int($value) && $value > $cutoff)) : [];
$requestsByClient = array_filter($requestsByClient, static function ($times) use ($cutoff): bool {
    if (!is_array($times)) {
        return false;
    }
    return count(array_filter($times, static fn ($value) => is_int($value) && $value > $cutoff)) > 0;
});
if (count($requestTimes) >= 5) {
    flock($rateFile, LOCK_UN);
    fclose($rateFile);
    header('Retry-After: 600');
    respond(429, ['ok' => false, 'message' => 'Terlalu banyak permintaan dari perangkat ini. Coba kembali beberapa menit lagi.']);
}
$requestTimes[] = time();
$requestsByClient[$clientKey] = $requestTimes;
rewind($rateFile);
ftruncate($rateFile, 0);
fwrite($rateFile, json_encode($requestsByClient));
fflush($rateFile);
flock($rateFile, LOCK_UN);
fclose($rateFile);

$name = isset($payload['name']) && is_string($payload['name']) ? trim($payload['name']) : '';
$phone = isset($payload['phone']) && is_string($payload['phone']) ? trim($payload['phone']) : '';
$serviceId = filter_var($payload['serviceId'] ?? null, FILTER_VALIDATE_INT);
$date = isset($payload['date']) && is_string($payload['date']) ? $payload['date'] : '';
$time = isset($payload['time']) && is_string($payload['time']) ? $payload['time'] : '';
$nameLength = preg_match_all('/./us', $name);

if ($name === '' || $nameLength === false || $nameLength > 100 || preg_match('/[\x00-\x1F\x7F]/', $name)) {
    respond(422, ['ok' => false, 'message' => 'Masukkan nama lengkap (maksimal 100 karakter).']);
}

if (!preg_match('/^\+?[0-9][0-9\s().-]{7,18}$/', $phone)) {
    respond(422, ['ok' => false, 'message' => 'Masukkan nomor WhatsApp/HP yang valid.']);
}
$phoneDigits = preg_replace('/\D+/', '', $phone);
if (!is_string($phoneDigits) || strlen($phoneDigits) < 8 || strlen($phoneDigits) > 20) {
    respond(422, ['ok' => false, 'message' => 'Masukkan nomor WhatsApp/HP yang valid.']);
}
$storedPhone = str_starts_with($phone, '+') ? '+' . $phoneDigits : $phoneDigits;

if ($serviceId === false || $serviceId < 1) {
    respond(422, ['ok' => false, 'message' => 'Pilih layanan yang tersedia.']);
}
if (($payload['consent'] ?? false) !== true) {
    respond(422, ['ok' => false, 'message' => 'Persetujuan penggunaan data diperlukan untuk memproses reservasi.']);
}

$timezone = new DateTimeZone('Asia/Jakarta');
$bookingDate = DateTimeImmutable::createFromFormat('!Y-m-d', $date, $timezone);
$dateErrors = DateTimeImmutable::getLastErrors();
if ($bookingDate === false || ($dateErrors !== false && ($dateErrors['warning_count'] > 0 || $dateErrors['error_count'] > 0)) || $bookingDate->format('Y-m-d') !== $date) {
    respond(422, ['ok' => false, 'message' => 'Pilih tanggal reservasi yang valid.']);
}
$now = new DateTimeImmutable('now', $timezone);
if ($bookingDate->format('Y-m-d') < $now->format('Y-m-d')) {
    respond(422, ['ok' => false, 'message' => 'Tanggal reservasi tidak boleh sudah lewat.']);
}

if (!preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time)) {
    respond(422, ['ok' => false, 'message' => 'Pilih jam reservasi yang valid.']);
}
$bookingDateTime = DateTimeImmutable::createFromFormat('!Y-m-d H:i', $date . ' ' . $time, $timezone);
if ($bookingDateTime === false || $bookingDateTime <= $now) {
    respond(422, ['ok' => false, 'message' => 'Jam reservasi harus berada di waktu mendatang.']);
}

try {
    $pdo->beginTransaction();

    $serviceStatement = $pdo->prepare("SELECT nama_layanan, durasi_menit FROM layanan WHERE id_layanan = ? AND status = 'aktif' LIMIT 1");
    $serviceStatement->execute([$serviceId]);
    $service = $serviceStatement->fetch(PDO::FETCH_ASSOC);
    if (!$service) {
        $pdo->rollBack();
        respond(422, ['ok' => false, 'message' => 'Layanan tidak tersedia. Silakan pilih layanan lain.']);
    }

    $openingMinutes = (int)$bookingDate->format('w') === 0 ? 10 * 60 : 9 * 60;
    [$hour, $minute] = array_map('intval', explode(':', $time));
    $startMinutes = $hour * 60 + $minute;
    $duration = max(1, (int)$service['durasi_menit']);
    if ($startMinutes < $openingMinutes || $startMinutes + $duration > 20 * 60) {
        $pdo->rollBack();
        respond(422, ['ok' => false, 'message' => 'Jam pilihan berada di luar jam operasional atau layanan melewati jam tutup. Pilih jam lain.']);
    }

    $customerStatement = $pdo->prepare(
        "SELECT id_pelanggan FROM pelanggan
         WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(no_hp, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') = ?
         ORDER BY id_pelanggan ASC LIMIT 1"
    );
    $customerStatement->execute([$phoneDigits]);
    $customerId = $customerStatement->fetchColumn();
    if ($customerId === false) {
        $customerStatement = $pdo->prepare('INSERT INTO pelanggan (nama_pelanggan, no_hp) VALUES (?, ?)');
        $customerStatement->execute([$name, $storedPhone]);
        $customerId = (int)$pdo->lastInsertId();
    }

    $bookingCode = 'BK-' . $now->format('YmdHis') . '-' . strtoupper(bin2hex(random_bytes(3)));
    $bookingStatement = $pdo->prepare(
        "INSERT INTO booking (kode_booking, id_pelanggan, id_barber, id_layanan, tgl_booking, jam_booking, status, catatan)
         VALUES (?, ?, NULL, ?, ?, ?, 'menunggu', ?)"
    );
    $bookingStatement->execute([
        $bookingCode,
        (int)$customerId,
        $serviceId,
        $bookingDate->format('Y-m-d'),
        $time . ':00',
        'Permintaan dari situs Bone Barber Assistant. Menunggu konfirmasi admin/kasir.',
    ]);

    $pdo->commit();
    respond(201, [
        'ok' => true,
        'bookingCode' => $bookingCode,
        'message' => 'Permintaan reservasi sudah diterima dan menunggu konfirmasi admin/kasir.',
    ]);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Simpan booking publik gagal: ' . $error->getMessage());
    respond(500, ['ok' => false, 'message' => 'Permintaan reservasi gagal disimpan. Silakan coba kembali atau hubungi admin.']);
}
