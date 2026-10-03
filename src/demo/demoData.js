// Демо-профиль: вымышленные данные рождения + готовый бесплатный разбор.
// Карта (demoChart.js) рассчитана движком проекта для этих же данных.

export { DEMO_CHART } from "./demoChart";

// Формат совпадает с тем, что собирает BirthForm (buildBirthData)
export const DEMO_BIRTH_DATA = {
  date: { day: "27", month: "04", year: "1997" },
  time: { hour: "07", minute: "30" },
  timeIsApproximate: false,
  city: "Ташкент, Узбекистан",
  gender: "female",
  location: { latitude: 41.2646, longitude: 69.2163 },
  timezoneName: "Asia/Tashkent",
};

// Подсказка города для формы (формат ответа GET /cities/search)
export const DEMO_CITY = {
  city: "Ташкент",
  region: null,
  country: "Узбекистан",
  label: DEMO_BIRTH_DATA.city,
  latitude: DEMO_BIRTH_DATA.location.latitude,
  longitude: DEMO_BIRTH_DATA.location.longitude,
  timezone_name: DEMO_BIRTH_DATA.timezoneName,
};

// Бесплатный разбор "Кто ты" — портрет по трём точкам (RU + EN).
//   point   — ключ в карте: имя планеты или "ASC" (angles.ascendant)
// Знак, градус, дом и стихия на экране берутся из самой карты.
export const DEMO_TEASER = {
  ru: {
    formula: "Снаружи — лёгкая, внутри — основательная, в чувствах — свободная.",
    points: [
      {
        point: "Солнце",
        role: "Характер и воля",
        title: "Солнце в Тельце",
        tagline: "Твоя опора — устойчивость",
        keywords: ["основательность", "комфорт", "терпение"],
        text:
          "Ты не бросаешься в новое с разбега: сначала присматриваешься, " +
          "проверяешь на прочность — и только потом вкладываешься, зато " +
          "надолго. Солнце в 12 доме: силы ты набираешь в тишине, и со " +
          "стороны кажешься спокойнее, чем есть на самом деле.",
        strength: "Доводишь начатое до осязаемого результата.",
        watch: "Упрямство: держишься за привычное дольше, чем нужно.",
      },
      {
        point: "Луна",
        role: "Эмоции и потребности",
        title: "Луна в Стрельце",
        tagline: "Чувствам нужны простор и смысл",
        keywords: ["свобода", "движение", "честность"],
        text:
          "Когда становится тесно — в графике, в отношениях, в привычном " +
          "маршруте, — настроение падает первым. Ты быстро загораешься " +
          "идеями и поездками. Луна в 7 доме: чувства раскрываются в паре — " +
          "с человеком, с которым можно и поспорить, и помечтать.",
        strength: "Быстро восстанавливаешься через движение и честный разговор.",
        watch: "Скука и рутина гасят тебя быстрее, чем трудности.",
      },
      {
        point: "ASC",
        role: "Первое впечатление",
        title: "Асцендент в Близнецах",
        tagline: "Тебя видят лёгкой и любопытной",
        keywords: ["общение", "любопытство", "скорость"],
        text:
          "Ты легко заводишь разговор, задаёшь вопросы и схватываешь на " +
          "лету. Поэтому кажешься более открытой и подвижной, чем чувствуешь " +
          "себя внутри. Это твой способ входить в новое — через людей и " +
          "информацию.",
        strength: "Находишь общий язык почти с кем угодно.",
        watch: "Легко распылиться на десять тем сразу.",
      },
    ],
    blend: {
      title: "Как это складывается",
      rows: [
        { label: "Снаружи", point: "ASC", text: "подвижность и интерес к людям" },
        { label: "Внутри", point: "Солнце", text: "неторопливость и основательность" },
        { label: "В чувствах", point: "Луна", text: "потребность в свободе" },
      ],
      text:
        "Ты производишь впечатление человека, который легко меняется, но на " +
        "деле меняешься медленно и основательно. Твой ритм: широко " +
        "посмотреть — выбрать одно — довести до конца.",
      accent: {
        title: "Особенность карты",
        // Аспект, который подсвечивается: орбис берётся из карты
        aspect: ["Солнце", "Уран"],
        text:
          "Точный квадрат добавляет тягу к независимости: время от времени " +
          "тебе нужно резко что-то поменять, чтобы стабильность не " +
          "превращалась в застой.",
      },
    },
  },

  en: {
    formula: "Light on the outside, steady within, free at heart.",
    points: [
      {
        point: "Солнце",
        role: "Character and will",
        title: "Sun in Taurus",
        tagline: "Stability is your anchor",
        keywords: ["thoroughness", "comfort", "patience"],
        text:
          "You don't jump into new things at full speed: first you take a " +
          "look, test how solid it is — and only then commit, but for the " +
          "long run. With the Sun in the 12th house you recharge in quiet, " +
          "and from the outside you seem calmer than you really are.",
        strength: "You carry things through to a tangible result.",
        watch: "Stubbornness: you hold on to the familiar longer than you need to.",
      },
      {
        point: "Луна",
        role: "Emotions and needs",
        title: "Moon in Sagittarius",
        tagline: "Your feelings need space and meaning",
        keywords: ["freedom", "movement", "honesty"],
        text:
          "When things get tight — in your schedule, a relationship, the " +
          "usual route — your mood is the first to drop. You light up fast " +
          "over ideas and trips. With the Moon in the 7th house your " +
          "feelings open up in a couple — with someone you can both argue " +
          "and dream with.",
        strength: "You bounce back quickly through movement and an honest talk.",
        watch: "Boredom and routine drain you faster than difficulties do.",
      },
      {
        point: "ASC",
        role: "First impression",
        title: "Ascendant in Gemini",
        tagline: "People see you as light and curious",
        keywords: ["conversation", "curiosity", "speed"],
        text:
          "You strike up a conversation easily, ask questions and pick " +
          "things up on the fly. So you come across as more open and " +
          "changeable than you feel inside. This is how you enter anything " +
          "new — through people and information.",
        strength: "You find common ground with almost anyone.",
        watch: "It's easy to scatter across ten topics at once.",
      },
    ],
    blend: {
      title: "How it comes together",
      rows: [
        { label: "Outside", point: "ASC", text: "quick and interested in people" },
        { label: "Inside", point: "Солнце", text: "unhurried and thorough" },
        { label: "In feelings", point: "Луна", text: "a need for freedom" },
      ],
      text:
        "You come across as someone who changes easily, but in fact you " +
        "change slowly and thoroughly. Your rhythm: look wide — pick one " +
        "thing — see it through.",
      accent: {
        title: "Chart highlight",
        aspect: ["Солнце", "Уран"],
        text:
          "A tight square adds a pull towards independence: every now and " +
          "then you need to change something abruptly so that stability " +
          "doesn't turn into stagnation.",
      },
    },
  },
};
