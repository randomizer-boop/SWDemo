// Мок-данные для DevScreenSwitcher: реальный расчёт движка
// (Конаев, 04.02.2004 13:20). Используются только в dev-режиме.

export const MOCK_BIRTH_DATA = {
  date: { day: "4", month: "2", year: "2004" },
  time: { hour: "13", minute: "20" },
  timeIsApproximate: false,
  city: "Конаев, Алматинская область, Казахстан",
  gender: "male",
  location: { latitude: 43.85, longitude: 77.05 },
  timezoneName: "Asia/Almaty",
};

export const MOCK_CHART = {
  "planets": {
    "Солнце": {
      "longitude": 314.81,
      "sign": "Водолей",
      "degree_in_sign": 14.81,
      "retrograde": false,
      "house": 9
    },
    "Луна": {
      "longitude": 110.93,
      "sign": "Рак",
      "degree_in_sign": 20.93,
      "retrograde": false,
      "house": 2
    },
    "Меркурий": {
      "longitude": 295.74,
      "sign": "Козерог",
      "degree_in_sign": 25.74,
      "retrograde": false,
      "house": 8
    },
    "Венера": {
      "longitude": 354.81,
      "sign": "Рыбы",
      "degree_in_sign": 24.81,
      "retrograde": false,
      "house": 11
    },
    "Марс": {
      "longitude": 30.56,
      "sign": "Телец",
      "degree_in_sign": 0.56,
      "retrograde": false,
      "house": 11
    },
    "Юпитер": {
      "longitude": 167.37,
      "sign": "Дева",
      "degree_in_sign": 17.37,
      "retrograde": true,
      "house": 4
    },
    "Сатурн": {
      "longitude": 97.23,
      "sign": "Рак",
      "degree_in_sign": 7.23,
      "retrograde": true,
      "house": 2
    },
    "Уран": {
      "longitude": 331.77,
      "sign": "Рыбы",
      "degree_in_sign": 1.77,
      "retrograde": false,
      "house": 10
    },
    "Нептун": {
      "longitude": 312.94,
      "sign": "Водолей",
      "degree_in_sign": 12.94,
      "retrograde": false,
      "house": 9
    },
    "Плутон": {
      "longitude": 261.59,
      "sign": "Стрелец",
      "degree_in_sign": 21.59,
      "retrograde": false,
      "house": 7
    },
    "Раху": {
      "longitude": 46.15,
      "sign": "Телец",
      "degree_in_sign": 16.15,
      "retrograde": true,
      "house": 12
    },
    "Лилит": {
      "longitude": 69.79,
      "sign": "Близнецы",
      "degree_in_sign": 9.79,
      "retrograde": false,
      "house": 12
    },
    "Кету": {
      "longitude": 226.15,
      "sign": "Скорпион",
      "degree_in_sign": 16.15,
      "retrograde": true,
      "house": 6
    },
    "Селена": {
      "longitude": 249.79,
      "sign": "Стрелец",
      "degree_in_sign": 9.79,
      "retrograde": false,
      "house": 6
    },
    "Вертекс": {
      "longitude": 217.99,
      "sign": "Скорпион",
      "degree_in_sign": 7.99,
      "retrograde": false,
      "house": 6
    },
    "Парс Фортуны": {
      "longitude": 231.87,
      "sign": "Скорпион",
      "degree_in_sign": 21.87,
      "retrograde": false,
      "house": 6
    }
  },
  "angles": {
    "ascendant": {
      "longitude": 75.75,
      "sign": "Близнецы",
      "degree_in_sign": 15.75
    },
    "midheaven": {
      "longitude": 318.42,
      "sign": "Водолей",
      "degree_in_sign": 18.42
    },
    "descendant": {
      "longitude": 255.75,
      "sign": "Стрелец",
      "degree_in_sign": 15.75
    }
  },
  "houses": {
    "1": {
      "longitude": 75.75,
      "sign": "Близнецы",
      "degree_in_sign": 15.75
    },
    "2": {
      "longitude": 96.55,
      "sign": "Рак",
      "degree_in_sign": 6.55
    },
    "3": {
      "longitude": 116.05,
      "sign": "Рак",
      "degree_in_sign": 26.05
    },
    "4": {
      "longitude": 138.42,
      "sign": "Лев",
      "degree_in_sign": 18.42
    },
    "5": {
      "longitude": 168.46,
      "sign": "Дева",
      "degree_in_sign": 18.46
    },
    "6": {
      "longitude": 210.62,
      "sign": "Скорпион",
      "degree_in_sign": 0.62
    },
    "7": {
      "longitude": 255.75,
      "sign": "Стрелец",
      "degree_in_sign": 15.75
    },
    "8": {
      "longitude": 276.55,
      "sign": "Козерог",
      "degree_in_sign": 6.55
    },
    "9": {
      "longitude": 296.05,
      "sign": "Козерог",
      "degree_in_sign": 26.05
    },
    "10": {
      "longitude": 318.42,
      "sign": "Водолей",
      "degree_in_sign": 18.42
    },
    "11": {
      "longitude": 348.46,
      "sign": "Рыбы",
      "degree_in_sign": 18.46
    },
    "12": {
      "longitude": 30.62,
      "sign": "Телец",
      "degree_in_sign": 0.62
    }
  },
  "aspects": [
    {
      "planet1": "Солнце",
      "planet2": "Юпитер",
      "aspect": "Квиконс",
      "orb": 2.57
    },
    {
      "planet1": "Солнце",
      "planet2": "Нептун",
      "aspect": "Соединение",
      "orb": 1.87
    },
    {
      "planet1": "Солнце",
      "planet2": "Раху",
      "aspect": "Квадрат",
      "orb": 1.34
    },
    {
      "planet1": "Солнце",
      "planet2": "Лилит",
      "aspect": "Трин",
      "orb": 5.01
    },
    {
      "planet1": "Солнце",
      "planet2": "Кету",
      "aspect": "Квадрат",
      "orb": 1.34
    },
    {
      "planet1": "Солнце",
      "planet2": "Селена",
      "aspect": "Секстиль",
      "orb": 5.02
    },
    {
      "planet1": "Солнце",
      "planet2": "Вертекс",
      "aspect": "Квадрат",
      "orb": 6.82
    },
    {
      "planet1": "Луна",
      "planet2": "Меркурий",
      "aspect": "Оппозиция",
      "orb": 4.81
    },
    {
      "planet1": "Луна",
      "planet2": "Венера",
      "aspect": "Трин",
      "orb": 3.88
    },
    {
      "planet1": "Луна",
      "planet2": "Юпитер",
      "aspect": "Секстиль",
      "orb": 3.55
    },
    {
      "planet1": "Луна",
      "planet2": "Плутон",
      "aspect": "Квиконс",
      "orb": 0.66
    },
    {
      "planet1": "Луна",
      "planet2": "Раху",
      "aspect": "Секстиль",
      "orb": 4.78
    },
    {
      "planet1": "Луна",
      "planet2": "Кету",
      "aspect": "Трин",
      "orb": 4.78
    },
    {
      "planet1": "Луна",
      "planet2": "Парс Фортуны",
      "aspect": "Трин",
      "orb": 0.94
    },
    {
      "planet1": "Меркурий",
      "planet2": "Венера",
      "aspect": "Секстиль",
      "orb": 0.92
    },
    {
      "planet1": "Меркурий",
      "planet2": "Марс",
      "aspect": "Квадрат",
      "orb": 4.83
    },
    {
      "planet1": "Меркурий",
      "planet2": "Парс Фортуны",
      "aspect": "Секстиль",
      "orb": 3.87
    },
    {
      "planet1": "Венера",
      "planet2": "Юпитер",
      "aspect": "Оппозиция",
      "orb": 7.44
    },
    {
      "planet1": "Венера",
      "planet2": "Плутон",
      "aspect": "Квадрат",
      "orb": 3.23
    },
    {
      "planet1": "Венера",
      "planet2": "Парс Фортуны",
      "aspect": "Трин",
      "orb": 2.94
    },
    {
      "planet1": "Марс",
      "planet2": "Уран",
      "aspect": "Секстиль",
      "orb": 1.21
    },
    {
      "planet1": "Марс",
      "planet2": "Вертекс",
      "aspect": "Оппозиция",
      "orb": 7.42
    },
    {
      "planet1": "Юпитер",
      "planet2": "Плутон",
      "aspect": "Квадрат",
      "orb": 4.21
    },
    {
      "planet1": "Юпитер",
      "planet2": "Раху",
      "aspect": "Трин",
      "orb": 1.23
    },
    {
      "planet1": "Юпитер",
      "planet2": "Кету",
      "aspect": "Секстиль",
      "orb": 1.22
    },
    {
      "planet1": "Юпитер",
      "planet2": "Парс Фортуны",
      "aspect": "Секстиль",
      "orb": 4.49
    },
    {
      "planet1": "Сатурн",
      "planet2": "Уран",
      "aspect": "Трин",
      "orb": 5.46
    },
    {
      "planet1": "Сатурн",
      "planet2": "Селена",
      "aspect": "Квиконс",
      "orb": 2.56
    },
    {
      "planet1": "Сатурн",
      "planet2": "Вертекс",
      "aspect": "Трин",
      "orb": 0.75
    },
    {
      "planet1": "Уран",
      "planet2": "Вертекс",
      "aspect": "Трин",
      "orb": 6.21
    },
    {
      "planet1": "Нептун",
      "planet2": "Раху",
      "aspect": "Квадрат",
      "orb": 3.21
    },
    {
      "planet1": "Нептун",
      "planet2": "Лилит",
      "aspect": "Трин",
      "orb": 3.15
    },
    {
      "planet1": "Нептун",
      "planet2": "Кету",
      "aspect": "Квадрат",
      "orb": 3.21
    },
    {
      "planet1": "Нептун",
      "planet2": "Селена",
      "aspect": "Секстиль",
      "orb": 3.15
    },
    {
      "planet1": "Нептун",
      "planet2": "Вертекс",
      "aspect": "Квадрат",
      "orb": 4.95
    },
    {
      "planet1": "Раху",
      "planet2": "Кету",
      "aspect": "Оппозиция",
      "orb": 0.0
    },
    {
      "planet1": "Раху",
      "planet2": "Парс Фортуны",
      "aspect": "Оппозиция",
      "orb": 5.72
    },
    {
      "planet1": "Лилит",
      "planet2": "Селена",
      "aspect": "Оппозиция",
      "orb": 0.0
    },
    {
      "planet1": "Лилит",
      "planet2": "Вертекс",
      "aspect": "Квиконс",
      "orb": 1.81
    },
    {
      "planet1": "Кету",
      "planet2": "Парс Фортуны",
      "aspect": "Соединение",
      "orb": 5.72
    }
  ],
  "configurations": [
    {
      "type": "Тау-квадрат",
      "planets": [
        "Солнце",
        "Раху",
        "Кету"
      ]
    },
    {
      "type": "Большой тригон",
      "planets": [
        "Луна",
        "Венера",
        "Парс Фортуны"
      ]
    },
    {
      "type": "Бисекстиль",
      "planets": [
        "Луна",
        "Юпитер",
        "Раху"
      ]
    },
    {
      "type": "Бисекстиль",
      "planets": [
        "Луна",
        "Юпитер",
        "Кету"
      ]
    },
    {
      "type": "Бисекстиль",
      "planets": [
        "Луна",
        "Юпитер",
        "Парс Фортуны"
      ]
    },
    {
      "type": "Бисекстиль",
      "planets": [
        "Меркурий",
        "Венера",
        "Парс Фортуны"
      ]
    },
    {
      "type": "Тау-квадрат",
      "planets": [
        "Венера",
        "Юпитер",
        "Плутон"
      ]
    },
    {
      "type": "Большой тригон",
      "planets": [
        "Сатурн",
        "Уран",
        "Вертекс"
      ]
    },
    {
      "type": "Тау-квадрат",
      "planets": [
        "Нептун",
        "Раху",
        "Кету"
      ]
    }
  ]
};