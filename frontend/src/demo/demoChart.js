// Натальная карта демо-профиля (Ташкент, 27.04.1997, 07:30, UTC+5).
// Рассчитана движком проекта (backend/main_engine.py, Swiss Ephemeris,
// дома Плацидус) и сохранена статически: в демо-версии бэкенда нет.
// Формат совпадает с ответом POST /calculate -> data.

export const DEMO_CHART = {
  "planets": {
    "Солнце": {
      "longitude": 36.88,
      "sign": "Телец",
      "degree_in_sign": 6.88,
      "retrograde": false,
      "house": 12
    },
    "Луна": {
      "longitude": 268.28,
      "sign": "Стрелец",
      "degree_in_sign": 28.28,
      "retrograde": false,
      "house": 7
    },
    "Меркурий": {
      "longitude": 34.13,
      "sign": "Телец",
      "degree_in_sign": 4.13,
      "retrograde": true,
      "house": 12
    },
    "Венера": {
      "longitude": 43.22,
      "sign": "Телец",
      "degree_in_sign": 13.22,
      "retrograde": false,
      "house": 12
    },
    "Марс": {
      "longitude": 166.74,
      "sign": "Дева",
      "degree_in_sign": 16.74,
      "retrograde": true,
      "house": 4
    },
    "Юпитер": {
      "longitude": 319.03,
      "sign": "Водолей",
      "degree_in_sign": 19.03,
      "retrograde": false,
      "house": 9
    },
    "Сатурн": {
      "longitude": 13.6,
      "sign": "Овен",
      "degree_in_sign": 13.6,
      "retrograde": false,
      "house": 11
    },
    "Уран": {
      "longitude": 308.57,
      "sign": "Водолей",
      "degree_in_sign": 8.57,
      "retrograde": false,
      "house": 9
    },
    "Нептун": {
      "longitude": 299.95,
      "sign": "Козерог",
      "degree_in_sign": 29.95,
      "retrograde": false,
      "house": 9
    },
    "Плутон": {
      "longitude": 244.97,
      "sign": "Стрелец",
      "degree_in_sign": 4.97,
      "retrograde": true,
      "house": 6
    },
    "Раху": {
      "longitude": 178.05,
      "sign": "Дева",
      "degree_in_sign": 28.05,
      "retrograde": true,
      "house": 5
    },
    "Лилит": {
      "longitude": 154.33,
      "sign": "Дева",
      "degree_in_sign": 4.33,
      "retrograde": false,
      "house": 4
    },
    "Хирон": {
      "longitude": 208.28,
      "sign": "Весы",
      "degree_in_sign": 28.28,
      "retrograde": true,
      "house": 5
    },
    "Кету": {
      "longitude": 358.05,
      "sign": "Рыбы",
      "degree_in_sign": 28.05,
      "retrograde": true,
      "house": 11
    },
    "Селена": {
      "longitude": 334.33,
      "sign": "Рыбы",
      "degree_in_sign": 4.33,
      "retrograde": false,
      "house": 10
    },
    "Вертекс": {
      "longitude": 217.62,
      "sign": "Скорпион",
      "degree_in_sign": 7.62,
      "retrograde": false,
      "house": 6
    },
    "Парс Фортуны": {
      "longitude": 305.91,
      "sign": "Водолей",
      "degree_in_sign": 5.91,
      "retrograde": false,
      "house": 9
    }
  },
  "angles": {
    "ascendant": {
      "longitude": 74.51,
      "sign": "Близнецы",
      "degree_in_sign": 14.51
    },
    "midheaven": {
      "longitude": 319.42,
      "sign": "Водолей",
      "degree_in_sign": 19.42
    },
    "descendant": {
      "longitude": 254.51,
      "sign": "Стрелец",
      "degree_in_sign": 14.51
    }
  },
  "houses": {
    "1": {
      "longitude": 74.51,
      "sign": "Близнецы",
      "degree_in_sign": 14.51
    },
    "2": {
      "longitude": 96.09,
      "sign": "Рак",
      "degree_in_sign": 6.09
    },
    "3": {
      "longitude": 116.34,
      "sign": "Рак",
      "degree_in_sign": 26.34
    },
    "4": {
      "longitude": 139.42,
      "sign": "Лев",
      "degree_in_sign": 19.42
    },
    "5": {
      "longitude": 169.83,
      "sign": "Дева",
      "degree_in_sign": 19.83
    },
    "6": {
      "longitude": 211.03,
      "sign": "Скорпион",
      "degree_in_sign": 1.03
    },
    "7": {
      "longitude": 254.51,
      "sign": "Стрелец",
      "degree_in_sign": 14.51
    },
    "8": {
      "longitude": 276.09,
      "sign": "Козерог",
      "degree_in_sign": 6.09
    },
    "9": {
      "longitude": 296.34,
      "sign": "Козерог",
      "degree_in_sign": 26.34
    },
    "10": {
      "longitude": 319.42,
      "sign": "Водолей",
      "degree_in_sign": 19.42
    },
    "11": {
      "longitude": 349.83,
      "sign": "Рыбы",
      "degree_in_sign": 19.83
    },
    "12": {
      "longitude": 31.03,
      "sign": "Телец",
      "degree_in_sign": 1.03
    }
  },
  "aspects": [
    {
      "planet1": "Солнце",
      "planet2": "Меркурий",
      "aspect": "Соединение",
      "orb": 2.74
    },
    {
      "planet1": "Солнце",
      "planet2": "Венера",
      "aspect": "Соединение",
      "orb": 6.34
    },
    {
      "planet1": "Солнце",
      "planet2": "Уран",
      "aspect": "Квадрат",
      "orb": 1.69
    },
    {
      "planet1": "Солнце",
      "planet2": "Нептун",
      "aspect": "Квадрат",
      "orb": 6.93
    },
    {
      "planet1": "Солнце",
      "planet2": "Плутон",
      "aspect": "Квиконс",
      "orb": 1.91
    },
    {
      "planet1": "Солнце",
      "planet2": "Лилит",
      "aspect": "Трин",
      "orb": 2.55
    },
    {
      "planet1": "Солнце",
      "planet2": "Селена",
      "aspect": "Секстиль",
      "orb": 2.55
    },
    {
      "planet1": "Солнце",
      "planet2": "Вертекс",
      "aspect": "Оппозиция",
      "orb": 0.74
    },
    {
      "planet1": "Солнце",
      "planet2": "Парс Фортуны",
      "aspect": "Квадрат",
      "orb": 0.97
    },
    {
      "planet1": "Луна",
      "planet2": "Меркурий",
      "aspect": "Трин",
      "orb": 5.85
    },
    {
      "planet1": "Луна",
      "planet2": "Раху",
      "aspect": "Квадрат",
      "orb": 0.24
    },
    {
      "planet1": "Луна",
      "planet2": "Лилит",
      "aspect": "Трин",
      "orb": 6.04
    },
    {
      "planet1": "Луна",
      "planet2": "Хирон",
      "aspect": "Секстиль",
      "orb": 0.0
    },
    {
      "planet1": "Луна",
      "planet2": "Кету",
      "aspect": "Квадрат",
      "orb": 0.23
    },
    {
      "planet1": "Меркурий",
      "planet2": "Уран",
      "aspect": "Квадрат",
      "orb": 4.43
    },
    {
      "planet1": "Меркурий",
      "planet2": "Нептун",
      "aspect": "Квадрат",
      "orb": 4.18
    },
    {
      "planet1": "Меркурий",
      "planet2": "Плутон",
      "aspect": "Квиконс",
      "orb": 0.83
    },
    {
      "planet1": "Меркурий",
      "planet2": "Лилит",
      "aspect": "Трин",
      "orb": 0.19
    },
    {
      "planet1": "Меркурий",
      "planet2": "Хирон",
      "aspect": "Оппозиция",
      "orb": 5.85
    },
    {
      "planet1": "Меркурий",
      "planet2": "Селена",
      "aspect": "Секстиль",
      "orb": 0.2
    },
    {
      "planet1": "Меркурий",
      "planet2": "Вертекс",
      "aspect": "Оппозиция",
      "orb": 3.49
    },
    {
      "planet1": "Меркурий",
      "planet2": "Парс Фортуны",
      "aspect": "Квадрат",
      "orb": 1.78
    },
    {
      "planet1": "Венера",
      "planet2": "Марс",
      "aspect": "Трин",
      "orb": 3.52
    },
    {
      "planet1": "Венера",
      "planet2": "Юпитер",
      "aspect": "Квадрат",
      "orb": 5.81
    },
    {
      "planet1": "Венера",
      "planet2": "Уран",
      "aspect": "Квадрат",
      "orb": 4.65
    },
    {
      "planet1": "Венера",
      "planet2": "Вертекс",
      "aspect": "Оппозиция",
      "orb": 5.6
    },
    {
      "planet1": "Марс",
      "planet2": "Юпитер",
      "aspect": "Квиконс",
      "orb": 2.29
    },
    {
      "planet1": "Юпитер",
      "planet2": "Сатурн",
      "aspect": "Секстиль",
      "orb": 5.43
    },
    {
      "planet1": "Сатурн",
      "planet2": "Уран",
      "aspect": "Секстиль",
      "orb": 5.03
    },
    {
      "planet1": "Уран",
      "planet2": "Плутон",
      "aspect": "Секстиль",
      "orb": 3.6
    },
    {
      "planet1": "Уран",
      "planet2": "Вертекс",
      "aspect": "Квадрат",
      "orb": 0.95
    },
    {
      "planet1": "Уран",
      "planet2": "Парс Фортуны",
      "aspect": "Соединение",
      "orb": 2.66
    },
    {
      "planet1": "Нептун",
      "planet2": "Плутон",
      "aspect": "Секстиль",
      "orb": 5.02
    },
    {
      "planet1": "Нептун",
      "planet2": "Раху",
      "aspect": "Трин",
      "orb": 1.9
    },
    {
      "planet1": "Нептун",
      "planet2": "Хирон",
      "aspect": "Квадрат",
      "orb": 1.67
    },
    {
      "planet1": "Нептун",
      "planet2": "Кету",
      "aspect": "Секстиль",
      "orb": 1.9
    },
    {
      "planet1": "Нептун",
      "planet2": "Парс Фортуны",
      "aspect": "Соединение",
      "orb": 5.96
    },
    {
      "planet1": "Плутон",
      "planet2": "Лилит",
      "aspect": "Квадрат",
      "orb": 0.64
    },
    {
      "planet1": "Плутон",
      "planet2": "Кету",
      "aspect": "Трин",
      "orb": 6.92
    },
    {
      "planet1": "Плутон",
      "planet2": "Селена",
      "aspect": "Квадрат",
      "orb": 0.64
    },
    {
      "planet1": "Плутон",
      "planet2": "Парс Фортуны",
      "aspect": "Секстиль",
      "orb": 0.94
    },
    {
      "planet1": "Раху",
      "planet2": "Кету",
      "aspect": "Оппозиция",
      "orb": 0.0
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
      "aspect": "Секстиль",
      "orb": 3.29
    },
    {
      "planet1": "Лилит",
      "planet2": "Парс Фортуны",
      "aspect": "Квиконс",
      "orb": 1.58
    },
    {
      "planet1": "Хирон",
      "planet2": "Кету",
      "aspect": "Квиконс",
      "orb": 0.23
    },
    {
      "planet1": "Хирон",
      "planet2": "Селена",
      "aspect": "Трин",
      "orb": 6.05
    },
    {
      "planet1": "Селена",
      "planet2": "Вертекс",
      "aspect": "Трин",
      "orb": 3.29
    },
    {
      "planet1": "Вертекс",
      "planet2": "Парс Фортуны",
      "aspect": "Квадрат",
      "orb": 1.71
    }
  ],
  "configurations": [
    {
      "type": "Тау-квадрат",
      "planets": [
        "Солнце",
        "Уран",
        "Вертекс"
      ]
    },
    {
      "type": "Тау-квадрат",
      "planets": [
        "Солнце",
        "Вертекс",
        "Парс Фортуны"
      ]
    },
    {
      "type": "Большой тригон",
      "planets": [
        "Луна",
        "Меркурий",
        "Лилит"
      ]
    },
    {
      "type": "Тау-квадрат",
      "planets": [
        "Луна",
        "Раху",
        "Кету"
      ]
    },
    {
      "type": "Тау-квадрат",
      "planets": [
        "Меркурий",
        "Уран",
        "Вертекс"
      ]
    },
    {
      "type": "Тау-квадрат",
      "planets": [
        "Меркурий",
        "Нептун",
        "Хирон"
      ]
    },
    {
      "type": "Тау-квадрат",
      "planets": [
        "Меркурий",
        "Вертекс",
        "Парс Фортуны"
      ]
    },
    {
      "type": "Тау-квадрат",
      "planets": [
        "Венера",
        "Уран",
        "Вертекс"
      ]
    },
    {
      "type": "Бисекстиль",
      "planets": [
        "Нептун",
        "Плутон",
        "Кету"
      ]
    },
    {
      "type": "Тау-квадрат",
      "planets": [
        "Плутон",
        "Лилит",
        "Селена"
      ]
    }
  ]
};
