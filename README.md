# 🍔 Rogoźno Je — Lokalny Agregator Gastronomii (SMS 0 zł)

> **„Co dzisiaj zamawiamy?”** — Aplikacja webowa i PWA agregująca lokale gastronomiczne dla miasta **Rogoźno, Wielkopolska, Polska**.

---

## 💡 Kluczowe Założenie Projektu

**Platforma NIE korzysta z płatnych bramek SMS (Twilio, SMSAPI, itp.).**
Koszt wysyłki wiadomości dla właściciela platformy wynosi **0 zł**.

Zamówienie jest wysyłane **bezpośrednio z telefonu klienta**:
1. Klient wybiera dania i podaje dane do dostawy / odbioru.
2. Aplikacja generuje gotową, czytelną treść zamówienia bez zbędnych znaków (zoptymalizowaną pod standard 160 znaków GSM).
3. Kliknięcie **„ZAMÓW PRZEZ SMS”** otwiera systemową aplikację Wiadomości w telefonie z:
   - automatycznie wpisanym numerem telefonu lokalu,
   - automatycznie wklejoną treścią zamówienia.
4. Klient sam naciska **„Wyślij”**.
5. W przypadku urządzeń nieobsługujących automatycznego wstawiania treści, zamówienie jest automatycznie kopiowane do schowka, a aplikacja wyświetla czytelną instrukcję z przyciskiem awaryjnym **„KOPIUJ ZAMÓWIENIE”** oraz **„ZADZWOŃ DO RESTAURACJI”**.

---

## 🚀 Architektura i Dostępne Wersje

Projekt został przygotowany w dwóch w pełni kompatybilnych wersjach:
1. **Wersja PWA / SPA (React 19 + TypeScript + Tailwind CSS)**:
   - Działa bezpośrednio w przeglądarce i podglądzie AI Studio.
   - Posiada pełny Service Worker, manifest PWA, wsparcie instalacji na ekranie głównym (iPhone i Android).
   - Przechowuje koszyk i stan w `localStorage` (dane klienta nie są niepotrzebnie wysyłane ani gromadzone na serwerze — pełna ochrona prywatności).
   - Wbudowany panel administratora (`/admin` lub przycisk w menu, domyślne hasło: `admin123`).
2. **Wersja Backendowa (Python + Flask + SQLAlchemy + SQLite / PostgreSQL)** w katalogu `/python_backend/`:
   - Przygotowana pod serwer produkcyjny Ubuntu z Gunicorn i Nginx.

---

## 📋 Spis Treści Instrukcji Uruchomienia (Sekcja 30)

1. [Wymagania systemowe](#1-wymagania-systemowe)
2. [Instalacja repozytorium](#2-instalacja-repozytorium)
3. [Utworzenie środowiska wirtualnego (Python virtualenv)](#3-utworzenie-środowiska-wirtualnego)
4. [Instalacja bibliotek i zależności](#4-instalacja-zależności)
5. [Konfiguracja pliku .env](#5-konfiguracja-pliku-env)
6. [Inicjalizacja bazy danych (SQLite / PostgreSQL)](#6-inicjalizacja-bazy-danych)
7. [Utworzenie konta administratora](#7-utworzenie-konta-administratora)
8. [Uruchomienie lokalne (Development)](#8-uruchomienie-lokalne)
9. [Uruchomienie produkcyjne](#9-uruchomienie-produkcyjne)
10. [Konfiguracja Gunicorn (Systemd service)](#10-konfiguracja-gunicorn)
11. [Konfiguracja Nginx](#11-konfiguracja-nginx)
12. [Konfiguracja HTTPS (Let's Encrypt / Certbot)](#12-konfiguracja-https-certyfikat-ssl)

---

### 1. Wymagania systemowe

- **System operacyjny**: Ubuntu 22.04 LTS lub nowszy (lub macOS / Linux / Windows WSL)
- **Python**: 3.10 lub nowszy (`python3 --version`)
- **Node.js**: 20+ (dla frontendu PWA Vite)
- **Serwer WWW**: Nginx
- **Menedżer procesów**: Gunicorn + Systemd

---

### 2. Instalacja repozytorium

```bash
# Sklonuj repozytorium na swój serwer lub komputer lokalny:
git clone https://github.com/twoja-organizacja/rogozno-je.git
cd rogozno-je
```

---

### 3. Utworzenie środowiska wirtualnego

```bash
# Przejdź do katalogu backendu
cd python_backend

# Utwórz środowisko venv
python3 -m venv venv

# Aktywuj środowisko:
# Na Linux/Ubuntu:
source venv/bin/activate
# Na Windows (PowerShell):
# .\venv\Scripts\Activate.ps1
```

---

### 4. Instalacja zależności

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

### 5. Konfiguracja pliku `.env`

Skopiuj przykładową konfigurację:

```bash
cp .env.example .env
```

Edytuj plik `.env`:

```ini
SECRET_KEY="tutaj-wklej-dlugi-losowy-klucz-np-z-openssl-rand-hex-32"
FLASK_APP="run.py"
FLASK_ENV="production"

# Baza danych (domyślnie lokalny plik SQLite):
DATABASE_URL="sqlite:///rogozno_je.db"

# Przejście na PostgreSQL (opcjonalne):
# DATABASE_URL="postgresql://rogozno_user:bezpieczne_haslo@localhost:5432/rogozno_je_db"

# Numer telefonu restauracji testowej (Test Burger Rogoźno):
TEST_RESTAURANT_PHONE="+48500123456"

# Domyślne hasło administratora przy pierwszym uruchomieniu:
ADMIN_PASSWORD="twoje-tajne-haslo-admina"
```

---

### 6. Inicjalizacja bazy danych

Uruchom skrypt seedujący:

```bash
python seed.py
```

Skrypt:
- Tworzy tabele w bazie danych (SQLite lub PostgreSQL),
- Tworzy domyślnego użytkownika administratora (`admin`),
- Wprowadza restaurację **Test Burger Rogoźno** z kompletnym menu (Burgery, Dodatki, Napoje) oraz godzinami otwarcia zgodnymi ze specyfikacją.

---

### 7. Utworzenie administratora

Domyślny login i hasło po uruchomieniu `python seed.py`:
- **Login**: `admin`
- **Hasło**: wartość zmiennej `ADMIN_PASSWORD` z pliku `.env` (domyślnie: `admin123`)

W panelu `/admin` administrator może:
- Włączać / wyłączać lokale,
- Oznaczać restaurację jako „Tymczasowo zamknięte”,
- Zmieniać numer telefonu dla wiadomości SMS,
- Modyfikować koszty dostawy, minimalne zamówienie i godziny otwarcia,
- Zarządzać menu: dodawać pozycje, zmieniać ceny, oznaczać dania jako „Chwilowo niedostępne” lub ukrywać je.

---

### 8. Uruchomienie lokalne

#### A. Wersja PWA (React + Vite):
```bash
# W głównym katalogu projektu:
npm install
npm run dev
# Aplikacja wystartuje pod adresem: http://localhost:3000
```

#### B. Wersja Flask:
```bash
cd python_backend
source venv/bin/activate
python run.py
# Aplikacja wystartuje pod adresem: http://localhost:5000
```

---

### 9. Uruchomienie produkcyjne

Na serwerze produkcyjnym (np. Ubuntu na VPS Hetzner / OVH / DigitalOcean):
Umieść kod w katalogu `/var/www/rogozno-je`:

```bash
sudo mkdir -p /var/www/rogozno-je
sudo chown -R $USER:$USER /var/www/rogozno-je
cp -r . /var/www/rogozno-je/
```

Zbuduj frontend:
```bash
cd /var/www/rogozno-je
npm install
npm run build
```

---

### 10. Konfiguracja Gunicorn

Skopiuj przygotowany plik usługi systemd:

```bash
sudo cp /var/www/rogozno-je/deploy/rogozno-je.service /etc/systemd/system/rogozno-je.service
sudo systemctl daemon-reload
sudo systemctl start rogozno-je
sudo systemctl enable rogozno-je
sudo systemctl status rogozno-je
```

---

### 11. Konfiguracja Nginx

Skopiuj konfigurację Nginx z katalogu `deploy/`:

```bash
sudo cp /var/www/rogozno-je/deploy/nginx.conf /etc/nginx/sites-available/rogozno-je.conf
sudo ln -s /etc/nginx/sites-available/rogozno-je.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 12. Konfiguracja HTTPS (Certyfikat SSL)

Zainstaluj narzędzie Certbot dla Nginx:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Wygeneruj darmowy certyfikat Let's Encrypt z automatycznym odnawianiem:
sudo certbot --nginx -d rogozno-je.pl -d www.rogozno-je.pl
```

Certbot automatycznie skonfiguruje przekierowanie z HTTP na HTTPS oraz zadba o bezpieczne szyfrowanie SSL.

---

## 📱 Jak działa mechanizm linku `sms:`

Różnice pomiędzy systemami mobilnymi:

1. **iOS Safari**:
   Apple WebKit w starszych i nowszych wersjach stosuje separator `&body=`:
   ```text
   sms:+48500123456&body=TRESC_ZAKODOWANA
   ```
2. **Android Chrome**:
   Standard RFC 5724 definiuje separator `?body=`:
   ```text
   sms:+48500123456?body=TRESC_ZAKODOWANA
   ```
3. **Optymalizacja polskich znaków**:
   Aplikacja konwertuje polskie znaki diakrytyczne (ą->a, ę->e, ł->l, ó->o itd.). Dzięki temu SMS mieści się w standardzie 7-bitowego kodowania GSM (160 znaków na 1 segment SMS zamiast 70 znaków w kodowaniu UCS-2), co gwarantuje najniższy koszt i brak obcinania wiadomości przez operatorów.

---

## 🛡️ Bezpieczeństwo i Prywatność

- **Brak przechowywania wrażliwych danych**: Adresy i imiona wpisywane przez klientów nie są zbierane na serwerze — trafiają wyłącznie do treści wiadomości SMS na telefonie klienta.
- **Bezpieczny panel administratora**: Hasła hash'owane bezpiecznym algorytmem `Werkzeug` / `bcrypt`.
- **Brak integracji płatniczych**: Platforma nie przetwarza kart ani przelewów — rozliczenie odbywa się bezpośrednio u kuriera lub przy odbiorze w lokalu.
