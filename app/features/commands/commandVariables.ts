export type CommandVariableItem = {
  code: string;
  label: string;
  description: string;
  example?: string;
};

export type CommandVariableGroup = {
  title: string;
  items: CommandVariableItem[];
};

export const COMMAND_VARIABLE_GROUPS: CommandVariableGroup[] = [
  {
    title: "Кто вызвал команду",
    items: [
      {
        code: "$(user)",
        label: "Ник вызывающего",
        description:
          "Отображаемое имя зрителя, который написал команду в чат. В авто-сообщениях остаётся пустым.",
        example: "!hello → «Привет, $(user)!» → «Привет, Blade!»",
      },
      {
        code: "$(username)",
        label: "То же, что $(user)",
        description: "Полный алиас для $(user). Можно использовать любой из двух вариантов.",
      },
      {
        code: "$(userid)",
        label: "Twitch ID вызывающего",
        description: "Числовой идентификатор аккаунта того, кто вызвал команду.",
      },
      {
        code: "$(userlogin)",
        label: "Login вызывающего",
        description: "Логин в нижнем регистре (как в URL канала), без @.",
        example: "blade_user",
      },
      {
        code: "$(query)",
        label: "Текст после команды",
        description:
          "Всё, что зритель написал после имени команды через пробел. Если аргументов нет — пустая строка.",
        example: "!quote день хороший → «день хороший»",
      },
      {
        code: "$(args)",
        label: "То же, что $(query)",
        description: "Алиас для $(query). Удобно, если привыкли к синтаксису других ботов.",
      },
      {
        code: "$(1) … $(9)",
        label: "Аргумент по номеру",
        description:
          "Отдельные слова из $(query): $(1) — первое, $(2) — второе и т.д. Несуществующий номер даёт пустую строку.",
        example: "!duel $(1) $(2) → $(1)=первое слово, $(2)=второе",
      },
    ],
  },
  {
    title: "Случайный зритель в чате",
    items: [
      {
        code: "$(randomuser)",
        label: "Случайный участник чата",
        description:
          "Случайный ник из зрителей, которые писали в чат с начала текущего эфира. Подходит для розыгрышей и «обнять случайного». Если в чате ещё никто не писал — пусто.",
        example: "«Сегодня победил $(randomuser)!»",
      },
      {
        code: "$(randomuserlogin)",
        label: "Login случайного зрителя",
        description: "Login случайного участника из того же списка, что и $(randomuser).",
      },
      {
        code: "$(randomuserid)",
        label: "ID случайного зрителя",
        description: "Twitch ID случайного участника из списка активных в чате за эфир.",
      },
    ],
  },
  {
    title: "Канал и эфир",
    items: [
      {
        code: "$(channel)",
        label: "Login канала",
        description: "Логин Twitch-канала (стримера), на котором работает бот.",
      },
      {
        code: "$(channelname)",
        label: "Имя канала",
        description: "Отображаемое имя стримера, как в чате Twitch.",
      },
      {
        code: "$(game)",
        label: "Категория",
        description: "Название игры или категории стрима. Работает, когда канал в эфире; иначе пусто.",
        example: "Just Chatting",
      },
      {
        code: "$(title)",
        label: "Название стрима",
        description: "Заголовок трансляции из Twitch. Только когда стрим online.",
      },
      {
        code: "$(viewers)",
        label: "Зрители",
        description: "Текущее число зрителей на трансляции (по данным Twitch).",
        example: "128",
      },
      {
        code: "$(uptime)",
        label: "Длительность эфира",
        description: "Сколько идёт стрим: формат вроде «2ч 15м». Только в live.",
      },
      {
        code: "$(live)",
        label: "Метка «в эфире»",
        description: "Подставляет текст «в эфире», если стрим идёт. Иначе пустая строка.",
      },
      {
        code: "$(offline)",
        label: "Метка «офлайн»",
        description: "Подставляет «офлайн», если стрим не идёт. Иначе пустая строка.",
      },
    ],
  },
  {
    title: "Время и счётчики",
    items: [
      {
        code: "$(date)",
        label: "Дата",
        description: "Текущая дата по часовому поясу Europe/Moscow.",
        example: "03.07.2026",
      },
      {
        code: "$(time)",
        label: "Время",
        description: "Текущее время (Москва), без секунд.",
        example: "19:45",
      },
      {
        code: "$(dow)",
        label: "День недели",
        description: "Название дня недели на русском.",
        example: "пятница",
      },
      {
        code: "$(count)",
        label: "Счётчик вызовов",
        description:
          "Сколько раз команду уже вызывали в чате (включая текущий вызов). Не растёт от авто-отправки по таймеру.",
        example: "42",
      },
      {
        code: "$(remaining)",
        label: "Остаток cooldown",
        description:
          "Секунды до повторного вызова. Используется в сообщении при cooldown, если оно настроено.",
        example: "Подожди $(remaining)с",
      },
    ],
  },
  {
    title: "Случайные значения",
    items: [
      {
        code: "$(random 1 100)",
        label: "Случайное число в диапазоне",
        description: "Целое число от минимума до максимума включительно. Границы можно менять.",
        example: "$(random 1 6) → как кубик",
      },
      {
        code: "$(random)",
        label: "Случайное 0–100",
        description: "Случайное целое от 0 до 100 без аргументов.",
      },
      {
        code: "$(choice a|b|c)",
        label: "Случайный вариант из списка",
        description: "Выбирает один из вариантов, разделённых символом |.",
        example: "$(choice да|нет|может быть)",
      },
    ],
  },
];
