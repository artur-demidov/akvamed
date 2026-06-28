<?php
$DB_HOST = "127.0.0.1";
$DB_NAME = "akvamed";
$DB_USER = "root";
$DB_PASS = "";

function db(): PDO
{
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],
    );
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS requests (
            id    INT AUTO_INCREMENT PRIMARY KEY,
            name  VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(32)  NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    );
    return $pdo;
}

$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

if ($_SERVER["REQUEST_METHOD"] === "POST" && $path === "/request") {
    header("Content-Type: application/json; charset=utf-8");

    $name = trim($_POST["name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $phone = trim($_POST["phone"] ?? "");

    $fail = function (string $msg): void {
        echo json_encode(["ok" => false, "error" => $msg]);
        exit();
    };

    if ($name === "") {
        $fail("Укажите имя.");
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $fail("Некорректный email.");
    }
    if (!preg_match('/^\+?[0-9\s\-()]{10,20}$/', $phone)) {
        $fail("Некорректный телефон.");
    }

    try {
        $pdo = db();

        $stmt = $pdo->prepare(
            'SELECT 1 FROM requests
             WHERE (name = ? OR email = ? OR phone = ?)
               AND created_at > (NOW() - INTERVAL 5 MINUTE)
             LIMIT 1',
        );
        $stmt->execute([$name, $email, $phone]);
        if ($stmt->fetchColumn()) {
            $fail("Заявка уже была отправлена. Попробуйте позже.");
        }

        $stmt = $pdo->prepare(
            "INSERT INTO requests (name, email, phone) VALUES (?, ?, ?)",
        );
        $stmt->execute([$name, $email, $phone]);
    } catch (PDOException $e) {
        $fail("Ошибка сервера. Попробуйте позже.");
    }

    echo json_encode(["ok" => true]);
    exit();
}

if ($path !== "/" && is_file(__DIR__ . $path)) {
    return false;
}

header("Content-Type: text/html; charset=utf-8");
readfile(__DIR__ . "/index.html");
