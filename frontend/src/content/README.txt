src/content/ — бесплатный контент экрана «Кто ты» (статический JSON)
Источник правды: Word-файлы 00–12 → JSON → React. Приложение читает только JSON.

ui.json            подписи, кнопки, режим «без времени», шаблоны для одинаковых знаков, замок «Личность»
teaser.json        верх экрана, формула (шаблоны), тизер на главной
signs.json         Asc / Sun / Moon → знак (36 карточек): title, tagline, keywords, text, paragraphs, strength, watch, watchAlt, blendPhrase и поля для формулы
houses.json        Sun / Moon → знак → дом 1–12 (по 144 фразы)
combinations.json  AscSun (144) и SunMoon (144, в демо нет)
aspects.json       Sun → планета → вид связи (45; possible=false — не бывает)
smallTexts.json    запасные тексты («нет связи», «мягкие связи»), фазы Луны и прочее дополнительное

Ключи знаков английские (Aries…Pisces), русские названия и падежи — в signs.json (name, nameGenitive, namePrepositional).
Планеты: Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto. Связи: conjunction, sextile, square, trine, opposition. Стихии: fire, earth, air, water.

Отличия от исходного задания:
1) houses.json: Sun/Moon → знак → дом (а не просто дом): фразы написаны под каждый знак.
2) combinations.json: AscSun/SunMoon по 12×12 пар.
3) В signs.json text = p1 + p2 (в paragraphs они же отдельно).

Чего пока нет (данных не хватает, не выдумывала):
— текстов для платных разборов, прогноза дня, профиля, «Полной карты»;
— правил выбора связи для «Особенности карты» (балльная схема описана в «Правилах для движка», в JSON её нет);
— точных подписей плашек из кода проекта (взяла из дампа демо: Градус/Дом/Стихия).
