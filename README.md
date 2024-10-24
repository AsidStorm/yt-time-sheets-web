# Yandex Tracker Time Sheets Web

Это веб-морда для Yandex Tracker Time Sheets.

# Как запустить локально?

1. Скопируйте файл .env.localhost в файл .env
2. Выполните команду `yarn start`
3. Не забудьте запустить сервер из репозитория `yandex-tracker-time-sheets/api`

# Как собрать?

1. Скопируйте необходимый файл настроек в файл .env
2. Выполните команду `yarn build`

# Зачем столько конфигов?

1. .env - Текущий применяемый конфиг
2. .env.example - Тестовый пример
3. .env.localhost - Используется как пример для локального запуска

# ENV переменные

1. REACT_APP_API_HOST - HOST для бэкэнда
2. REACT_APP_API_PORT - Порт для бэкэнда при работе через http://
3. REACT_APP_HTTPS_API_PORT - Порт для бэкэнда при работе через https://
