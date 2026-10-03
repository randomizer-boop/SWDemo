// Тексты Политики конфиденциальности и Условий использования (RU + EN).
// Формат блока: строка — абзац, { h } — подзаголовок, { list } — список,
// { contact: "email" | "full" } — контакты из lib/constants.js.

export const LEGAL_LABELS = {
  ru: {
    back: "Назад",
    website: "Сайт",
    noEmail: "Напишите нам через «Поддержку» в профиле приложения.",
  },
  en: {
    back: "Back",
    website: "Website",
    noEmail: "Contact us via Support in the app profile.",
  },
};

// ---------- Privacy Policy ----------

const privacyEn = {
  title: "Privacy Policy",
  updated: "Last updated: October 3, 2026",
  intro: [
    "StarWise (“StarWise”, “we”, “us”, or “our”) respects your privacy and is committed to protecting your personal information.",
    "This Privacy Policy explains what information we collect, how we use it, how it is stored, and what choices you have when using the StarWise Telegram Mini App, website, and related services.",
  ],
  sections: [
    {
      title: "1. Information We Collect",
      blocks: [
        "Depending on how you use StarWise, we may collect and process the following information:",
        { h: "Telegram account information" },
        "When you use StarWise through Telegram, we may receive information provided by Telegram, such as:",
        {
          list: [
            "Telegram user ID;",
            "Telegram username, if available;",
            "first and last name, if provided by Telegram;",
            "language or other basic account information made available through Telegram.",
          ],
        },
        { h: "Birth information" },
        "To calculate an astrological chart, StarWise may process information that you provide, including:",
        {
          list: [
            "date of birth;",
            "time of birth;",
            "city or place of birth;",
            "geographical coordinates associated with the selected place of birth.",
          ],
        },
        "This information is used to calculate your astrological chart and provide related features.",
        { h: "Payment information" },
        "When you purchase digital content or subscriptions using Telegram Stars, payment processing is handled through Telegram.",
        "StarWise may receive and store information necessary to identify and manage a transaction, such as:",
        {
          list: [
            "Telegram user ID;",
            "purchase category;",
            "amount of Stars;",
            "payment status;",
            "Telegram payment charge ID;",
            "subscription or access status.",
          ],
        },
        "StarWise does not receive or store your bank card number or other card details processed by Telegram.",
        { h: "Technical information" },
        "Our hosting and infrastructure providers may automatically process technical information such as:",
        {
          list: [
            "IP address;",
            "browser and device information;",
            "timestamps;",
            "server logs;",
            "diagnostic and security information.",
          ],
        },
        "This information may be used to maintain the security, reliability, and performance of StarWise.",
      ],
    },
    {
      title: "2. How We Use Your Information",
      blocks: [
        "We use information we process to:",
        {
          list: [
            "calculate natal charts and other astrological results;",
            "provide StarWise features and content;",
            "authenticate users and maintain their access;",
            "process and manage purchases and subscriptions;",
            "provide customer support;",
            "prevent fraud, abuse, and unauthorized access;",
            "maintain and improve the service;",
            "troubleshoot technical problems;",
            "comply with applicable legal obligations.",
          ],
        },
        "We do not sell your personal information.",
      ],
    },
    {
      title: "3. Astrological Calculations",
      blocks: [
        "Birth information is used to perform astrological calculations requested by the user.",
        "Astrological results are provided for entertainment and informational purposes and should not be considered professional medical, financial, legal, or other professional advice.",
      ],
    },
    {
      title: "4. Third-Party Services",
      blocks: [
        "StarWise may use third-party services to operate the application and provide its features. These services may include:",
        {
          list: [
            "Telegram — authentication, Mini App functionality, bot communication, and payment processing;",
            "Neon — database hosting;",
            "Railway — backend hosting and infrastructure;",
            "Cloudflare — frontend hosting, security, and infrastructure;",
            "GeoNames — place and geographical data used for location search;",
            "AI service providers — where AI-powered interpretations or other features are enabled.",
          ],
        },
        "These providers may process information according to their own privacy policies and terms.",
      ],
    },
    {
      title: "5. Data Storage",
      blocks: [
        "We store personal information only for as long as reasonably necessary to provide StarWise, maintain user access, process transactions, resolve disputes, comply with legal obligations, and maintain security.",
        "Some information, such as transaction records, may need to be retained for longer periods where required for accounting, legal, fraud-prevention, or security purposes.",
        "When information is no longer needed, we may delete or anonymize it, subject to applicable legal requirements.",
      ],
    },
    {
      title: "6. Data Security",
      blocks: [
        "We take reasonable technical and organizational measures to protect personal information against unauthorized access, alteration, disclosure, or destruction.",
        "However, no internet-based service can guarantee complete security.",
        "You should also protect your Telegram account and device and avoid sharing access to your account with others.",
      ],
    },
    {
      title: "7. Your Rights",
      blocks: [
        "Depending on your location and applicable law, you may have rights regarding your personal information, including the right to:",
        {
          list: [
            "request access to personal information we hold about you;",
            "request correction of inaccurate information;",
            "request deletion of your information;",
            "request restriction of certain processing;",
            "object to certain types of processing;",
            "request a copy of certain information in a portable format;",
            "withdraw consent where processing is based on consent.",
          ],
        },
        "To exercise these rights, contact us at:",
        { contact: "email" },
        "We may need to verify your identity before processing certain requests.",
      ],
    },
    {
      title: "8. Children's Privacy",
      blocks: [
        "StarWise is not intended for children under the minimum age required by applicable law to use the service without parental consent.",
        "We do not knowingly collect personal information from children in violation of applicable law.",
      ],
    },
    {
      title: "9. International Data Transfers",
      blocks: [
        "StarWise and its service providers may process or store information in countries other than the country where you live.",
        "Where required by applicable law, we take appropriate measures to protect personal information transferred across borders.",
      ],
    },
    {
      title: "10. Changes to This Privacy Policy",
      blocks: [
        "We may update this Privacy Policy from time to time to reflect changes to StarWise, our practices, or applicable legal requirements.",
        "The updated version will be posted on this page with a revised “Last updated” date.",
      ],
    },
    {
      title: "11. Contact Us",
      blocks: [
        "If you have questions about this Privacy Policy or how StarWise handles personal information, contact:",
        { contact: "full" },
      ],
    },
  ],
};

const privacyRu = {
  title: "Политика конфиденциальности",
  updated: "Последнее обновление: 3 октября 2026 г.",
  intro: [
    "StarWise («StarWise», «мы», «нас» или «наш») уважает вашу конфиденциальность и стремится защищать вашу персональную информацию.",
    "Настоящая Политика конфиденциальности объясняет, какую информацию мы собираем, как мы её используем, как она хранится и какой выбор у вас есть при использовании Telegram Mini App StarWise, сайта и связанных сервисов.",
  ],
  sections: [
    {
      title: "1. Какую информацию мы собираем",
      blocks: [
        "В зависимости от того, как вы используете StarWise, мы можем собирать и обрабатывать следующую информацию:",
        { h: "Данные аккаунта Telegram" },
        "Когда вы используете StarWise через Telegram, мы можем получать информацию, которую предоставляет Telegram, например:",
        {
          list: [
            "идентификатор пользователя Telegram (user ID);",
            "имя пользователя (username) в Telegram, если оно есть;",
            "имя и фамилию, если их передаёт Telegram;",
            "язык и другую базовую информацию об аккаунте, доступную через Telegram.",
          ],
        },
        { h: "Данные о рождении" },
        "Для расчёта астрологической карты StarWise может обрабатывать информацию, которую вы указываете, в том числе:",
        {
          list: [
            "дату рождения;",
            "время рождения;",
            "город или место рождения;",
            "географические координаты выбранного места рождения.",
          ],
        },
        "Эта информация используется для расчёта вашей астрологической карты и работы связанных функций.",
        { h: "Платёжная информация" },
        "Когда вы покупаете цифровой контент или подписку за Telegram Stars, оплата обрабатывается через Telegram.",
        "StarWise может получать и хранить информацию, необходимую для идентификации и сопровождения транзакции, например:",
        {
          list: [
            "идентификатор пользователя Telegram;",
            "категорию покупки;",
            "количество Stars;",
            "статус платежа;",
            "идентификатор платежа Telegram (payment charge ID);",
            "статус подписки или доступа.",
          ],
        },
        "StarWise не получает и не хранит номер вашей банковской карты и другие данные карты, которые обрабатывает Telegram.",
        { h: "Техническая информация" },
        "Наши провайдеры хостинга и инфраструктуры могут автоматически обрабатывать техническую информацию, например:",
        {
          list: [
            "IP-адрес;",
            "сведения о браузере и устройстве;",
            "метки времени;",
            "серверные журналы (логи);",
            "диагностическую информацию и сведения, связанные с безопасностью.",
          ],
        },
        "Эта информация может использоваться для поддержания безопасности, надёжности и производительности StarWise.",
      ],
    },
    {
      title: "2. Как мы используем вашу информацию",
      blocks: [
        "Мы используем обрабатываемую информацию, чтобы:",
        {
          list: [
            "рассчитывать натальные карты и другие астрологические результаты;",
            "предоставлять функции и контент StarWise;",
            "аутентифицировать пользователей и сохранять их доступ;",
            "обрабатывать покупки и подписки и управлять ими;",
            "оказывать поддержку пользователям;",
            "предотвращать мошенничество, злоупотребления и несанкционированный доступ;",
            "поддерживать и улучшать сервис;",
            "устранять технические неполадки;",
            "соблюдать применимые требования законодательства.",
          ],
        },
        "Мы не продаём вашу персональную информацию.",
      ],
    },
    {
      title: "3. Астрологические расчёты",
      blocks: [
        "Данные о рождении используются для выполнения астрологических расчётов по запросу пользователя.",
        "Астрологические результаты предоставляются в развлекательных и информационных целях и не должны рассматриваться как медицинская, финансовая, юридическая или иная профессиональная консультация.",
      ],
    },
    {
      title: "4. Сторонние сервисы",
      blocks: [
        "StarWise может использовать сторонние сервисы для работы приложения и его функций. К ним могут относиться:",
        {
          list: [
            "Telegram — аутентификация, работа Mini App, связь через бота и обработка платежей;",
            "Neon — хостинг базы данных;",
            "Railway — хостинг и инфраструктура серверной части;",
            "Cloudflare — хостинг клиентской части, безопасность и инфраструктура;",
            "GeoNames — данные о населённых пунктах и географические данные для поиска места;",
            "провайдеры ИИ-сервисов — там, где включены интерпретации или другие функции на основе ИИ.",
          ],
        },
        "Эти провайдеры могут обрабатывать информацию в соответствии со своими собственными политиками конфиденциальности и условиями.",
      ],
    },
    {
      title: "5. Хранение данных",
      blocks: [
        "Мы храним персональную информацию только до тех пор, пока это разумно необходимо, чтобы предоставлять StarWise, сохранять доступ пользователей, обрабатывать транзакции, разрешать споры, соблюдать требования законодательства и обеспечивать безопасность.",
        "Некоторая информация, например записи о транзакциях, может храниться дольше, если это требуется для бухгалтерского учёта, соблюдения закона, предотвращения мошенничества или обеспечения безопасности.",
        "Когда информация больше не нужна, мы можем удалить или обезличить её с учётом применимых требований законодательства.",
      ],
    },
    {
      title: "6. Безопасность данных",
      blocks: [
        "Мы принимаем разумные технические и организационные меры для защиты персональной информации от несанкционированного доступа, изменения, раскрытия или уничтожения.",
        "Однако ни один интернет-сервис не может гарантировать абсолютную безопасность.",
        "Вам также следует защищать свой аккаунт Telegram и устройство и не передавать доступ к аккаунту другим людям.",
      ],
    },
    {
      title: "7. Ваши права",
      blocks: [
        "В зависимости от вашего местонахождения и применимого законодательства у вас могут быть права в отношении вашей персональной информации, включая право:",
        {
          list: [
            "запросить доступ к персональной информации, которую мы о вас храним;",
            "запросить исправление неточной информации;",
            "запросить удаление вашей информации;",
            "запросить ограничение определённых видов обработки;",
            "возразить против определённых видов обработки;",
            "запросить копию определённой информации в переносимом формате;",
            "отозвать согласие, если обработка основана на согласии.",
          ],
        },
        "Чтобы воспользоваться этими правами, свяжитесь с нами:",
        { contact: "email" },
        "Перед обработкой некоторых запросов нам может потребоваться подтвердить вашу личность.",
      ],
    },
    {
      title: "8. Конфиденциальность детей",
      blocks: [
        "StarWise не предназначен для детей младше минимального возраста, с которого применимое законодательство разрешает пользоваться сервисом без согласия родителей.",
        "Мы сознательно не собираем персональную информацию детей в нарушение применимого законодательства.",
      ],
    },
    {
      title: "9. Международная передача данных",
      blocks: [
        "StarWise и его поставщики услуг могут обрабатывать или хранить информацию в странах, отличных от страны вашего проживания.",
        "Когда этого требует применимое законодательство, мы принимаем надлежащие меры для защиты персональной информации при её трансграничной передаче.",
      ],
    },
    {
      title: "10. Изменения настоящей Политики",
      blocks: [
        "Мы можем время от времени обновлять Политику конфиденциальности, чтобы отразить изменения в StarWise, наших практиках или применимых требованиях законодательства.",
        "Обновлённая версия будет размещена на этой странице с новой датой «Последнее обновление».",
      ],
    },
    {
      title: "11. Связь с нами",
      blocks: [
        "Если у вас есть вопросы об этой Политике конфиденциальности или о том, как StarWise обращается с персональной информацией, свяжитесь с нами:",
        { contact: "full" },
      ],
    },
  ],
};

// ---------- Terms of Service (ЧЕРНОВИК) ----------

const termsEn = {
  title: "Terms of Service",
  updated: "Last updated: October 3, 2026",
  intro: [
    "These Terms of Service (“Terms”) govern your use of the StarWise Telegram Mini App, website, and related services (“StarWise”, “we”, “us”, or “our”).",
    "By using StarWise, you agree to these Terms. If you do not agree, please do not use StarWise.",
  ],
  sections: [
    {
      title: "1. The Service",
      blocks: [
        "StarWise calculates astrological (natal) charts from the birth information you provide and offers related content, such as chart interpretations, daily forecasts, and a Tarot card of the day.",
        "Some content is free. Other content is available as paid digital content or by subscription.",
      ],
    },
    {
      title: "2. Entertainment and Informational Purpose",
      blocks: [
        "Astrological content, forecasts, and Tarot cards are provided for entertainment and informational purposes only.",
        "They are not medical, psychological, financial, legal, or other professional advice, and they do not predict or guarantee any outcome. You are responsible for the decisions you make.",
        "Some content may be prepared with the help of AI and may contain inaccuracies.",
      ],
    },
    {
      title: "3. Eligibility and Your Telegram Account",
      blocks: [
        "StarWise is accessed through Telegram. Your use of Telegram is governed by Telegram's own terms.",
        "You must be old enough under applicable law to use StarWise and to make purchases, or have the permission of a parent or legal guardian.",
        "You are responsible for keeping your Telegram account and device secure and for the accuracy of the birth information you enter.",
      ],
    },
    {
      title: "4. Purchases and Telegram Stars",
      blocks: [
        {
          list: [
            "Paid content is purchased with Telegram Stars. Payments are processed by Telegram under its own terms.",
            "The price in Stars is shown in the app before you confirm a purchase.",
            "A one-time purchase unlocks the selected content for the Telegram account that made the purchase. Access is not transferable to another account.",
            "Access is provided after Telegram confirms the payment.",
            "Prices may change. A price change does not affect purchases that have already been made.",
          ],
        },
      ],
    },
    {
      title: "5. Subscriptions",
      blocks: [
        {
          list: [
            "The daily forecast subscription is paid in Telegram Stars for a 30-day period and renews automatically until it is cancelled.",
            "You can cancel the subscription at any time through Telegram. Access remains until the end of the period that has already been paid for.",
            "We do not provide partial refunds for an unused part of a period, except where required by applicable law.",
          ],
        },
      ],
    },
    {
      title: "6. Refunds",
      blocks: [
        "Because digital content becomes available immediately after purchase, purchases are generally non-refundable, except where required by applicable law.",
        "If you were charged but did not receive access, or were charged in error, contact support: we will restore access or refund the Stars.",
        "Refunds are returned in Telegram Stars. When a refund is issued, access to the related content is revoked.",
      ],
    },
    {
      title: "7. Acceptable Use",
      blocks: [
        "You agree not to:",
        {
          list: [
            "use StarWise for unlawful purposes;",
            "attempt to gain unauthorized access to StarWise or interfere with its operation;",
            "bypass payment or access restrictions;",
            "copy, resell, or redistribute paid content for commercial purposes;",
            "use automated means to overload the service or collect data from it.",
          ],
        },
      ],
    },
    {
      title: "8. Intellectual Property",
      blocks: [
        "StarWise, including its design, texts, interpretations, and software, belongs to us or our licensors.",
        "We grant you a personal, non-commercial, non-transferable right to use StarWise and the content you have access to. You may share your own results for personal purposes.",
      ],
    },
    {
      title: "9. Availability and Changes to the Service",
      blocks: [
        "We may change, suspend, or discontinue features of StarWise.",
        "We try to keep the service available, but we do not guarantee that it will be uninterrupted or error-free.",
      ],
    },
    {
      title: "10. Disclaimer and Limitation of Liability",
      blocks: [
        "StarWise is provided “as is” and “as available”, without warranties of any kind, to the maximum extent permitted by applicable law.",
        "To the maximum extent permitted by applicable law, we are not liable for indirect or consequential damages, or for decisions made on the basis of StarWise content. Our total liability is limited to the amount you paid to StarWise in the 12 months before the claim.",
        "Nothing in these Terms limits rights you have under mandatory consumer protection law.",
      ],
    },
    {
      title: "11. Suspension and Termination",
      blocks: [
        "You may stop using StarWise at any time.",
        "We may suspend or restrict access if these Terms are violated, or in cases of fraud or abuse.",
      ],
    },
    {
      title: "12. Privacy",
      blocks: [
        "How we handle personal information is described in our Privacy Policy.",
      ],
    },
    {
      title: "13. Changes to These Terms",
      blocks: [
        "We may update these Terms from time to time. The updated version will be posted on this page with a revised “Last updated” date.",
        "By continuing to use StarWise after an update, you accept the updated Terms.",
      ],
    },
    {
      title: "14. Contact Us",
      blocks: [
        "If you have questions about these Terms, contact:",
        { contact: "full" },
      ],
    },
  ],
};

const termsRu = {
  title: "Условия использования",
  updated: "Последнее обновление: 3 октября 2026 г.",
  intro: [
    "Настоящие Условия использования («Условия») регулируют использование Telegram Mini App StarWise, сайта и связанных сервисов («StarWise», «мы», «нас» или «наш»).",
    "Используя StarWise, вы соглашаетесь с этими Условиями. Если вы с ними не согласны, пожалуйста, не используйте StarWise.",
  ],
  sections: [
    {
      title: "1. Сервис",
      blocks: [
        "StarWise рассчитывает астрологические (натальные) карты по указанным вами данным о рождении и предлагает связанный контент: разборы карты, ежедневные прогнозы и карту Таро дня.",
        "Часть контента бесплатна. Остальной контент доступен как платный цифровой контент или по подписке.",
      ],
    },
    {
      title: "2. Развлекательный и информационный характер",
      blocks: [
        "Астрологический контент, прогнозы и карты Таро предоставляются исключительно в развлекательных и информационных целях.",
        "Они не являются медицинской, психологической, финансовой, юридической или иной профессиональной консультацией, не предсказывают и не гарантируют какой-либо результат. Ответственность за принимаемые решения несёте вы.",
        "Часть контента может готовиться с помощью ИИ и может содержать неточности.",
      ],
    },
    {
      title: "3. Кто может пользоваться сервисом и аккаунт Telegram",
      blocks: [
        "Доступ к StarWise осуществляется через Telegram. Использование Telegram регулируется собственными условиями Telegram.",
        "Вы должны достичь возраста, с которого применимое законодательство разрешает пользоваться StarWise и совершать покупки, либо иметь разрешение родителя или законного представителя.",
        "Вы отвечаете за безопасность своего аккаунта Telegram и устройства, а также за точность введённых данных о рождении.",
      ],
    },
    {
      title: "4. Покупки и Telegram Stars",
      blocks: [
        {
          list: [
            "Платный контент оплачивается в Telegram Stars. Платежи обрабатывает Telegram на своих условиях.",
            "Цена в Stars показывается в приложении до подтверждения покупки.",
            "Разовая покупка открывает выбранный контент для того аккаунта Telegram, с которого она совершена. Доступ не передаётся другому аккаунту.",
            "Доступ предоставляется после того, как Telegram подтвердит оплату.",
            "Цены могут меняться. Изменение цены не затрагивает уже совершённые покупки.",
          ],
        },
      ],
    },
    {
      title: "5. Подписка",
      blocks: [
        {
          list: [
            "Подписка на ежедневный прогноз оплачивается в Telegram Stars на 30 дней и продлевается автоматически, пока вы её не отмените.",
            "Отменить подписку можно в любой момент через Telegram. Доступ сохраняется до конца уже оплаченного периода.",
            "Мы не возвращаем часть оплаты за неиспользованную часть периода, кроме случаев, когда этого требует применимое законодательство.",
          ],
        },
      ],
    },
    {
      title: "6. Возвраты",
      blocks: [
        "Поскольку цифровой контент становится доступен сразу после покупки, покупки, как правило, не подлежат возврату, кроме случаев, когда этого требует применимое законодательство.",
        "Если оплата списана, а доступ не открылся, или оплата списана по ошибке — напишите в поддержку: мы восстановим доступ или вернём Stars.",
        "Возврат производится в Telegram Stars. При возврате доступ к соответствующему контенту отзывается.",
      ],
    },
    {
      title: "7. Допустимое использование",
      blocks: [
        "Вы обязуетесь не:",
        {
          list: [
            "использовать StarWise в противоправных целях;",
            "пытаться получить несанкционированный доступ к StarWise или мешать его работе;",
            "обходить оплату или ограничения доступа;",
            "копировать, перепродавать или распространять платный контент в коммерческих целях;",
            "использовать автоматизированные средства, чтобы перегружать сервис или собирать из него данные.",
          ],
        },
      ],
    },
    {
      title: "8. Интеллектуальная собственность",
      blocks: [
        "StarWise, включая дизайн, тексты, разборы и программное обеспечение, принадлежит нам или нашим лицензиарам.",
        "Мы предоставляем вам личное, некоммерческое, непередаваемое право пользоваться StarWise и контентом, к которому у вас есть доступ. Вы можете делиться собственными результатами в личных целях.",
      ],
    },
    {
      title: "9. Доступность и изменения сервиса",
      blocks: [
        "Мы можем изменять, приостанавливать или прекращать работу отдельных функций StarWise.",
        "Мы стараемся поддерживать сервис доступным, но не гарантируем, что он будет работать без перерывов и ошибок.",
      ],
    },
    {
      title: "10. Отказ от гарантий и ограничение ответственности",
      blocks: [
        "StarWise предоставляется «как есть» и «по мере доступности», без каких-либо гарантий — в максимальной степени, допускаемой применимым законодательством.",
        "В максимальной степени, допускаемой применимым законодательством, мы не несём ответственности за косвенные убытки и за решения, принятые на основе контента StarWise. Наша совокупная ответственность ограничена суммой, которую вы заплатили StarWise за 12 месяцев до предъявления требования.",
        "Ничто в этих Условиях не ограничивает ваши права по обязательным нормам законодательства о защите прав потребителей.",
      ],
    },
    {
      title: "11. Приостановка и прекращение доступа",
      blocks: [
        "Вы можете прекратить пользоваться StarWise в любой момент.",
        "Мы можем приостановить или ограничить доступ при нарушении этих Условий, а также в случае мошенничества или злоупотреблений.",
      ],
    },
    {
      title: "12. Конфиденциальность",
      blocks: [
        "То, как мы обращаемся с персональной информацией, описано в Политике конфиденциальности.",
      ],
    },
    {
      title: "13. Изменения Условий",
      blocks: [
        "Мы можем время от времени обновлять эти Условия. Обновлённая версия будет размещена на этой странице с новой датой «Последнее обновление».",
        "Продолжая пользоваться StarWise после обновления, вы принимаете обновлённые Условия.",
      ],
    },
    {
      title: "14. Связь с нами",
      blocks: [
        "Если у вас есть вопросы об этих Условиях, свяжитесь с нами:",
        { contact: "full" },
      ],
    },
  ],
};

export const LEGAL_DOCS = {
  privacy: { ru: privacyRu, en: privacyEn },
  terms: { ru: termsRu, en: termsEn },
};
