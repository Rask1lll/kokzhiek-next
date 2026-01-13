import Cookies from "js-cookie";
function getPositiveFeedback(): string {
  const lang = Cookies.get("locale");
  if (lang === "kk") {
    const feedbacks = [
      "Сен дұрыс жауап бердің, осылай жалғастыр!",
      "Дұрыс, жарайсың!",
      "Өте жақсы, дұрыс!",
      "Тамаша, дұрыс жауап!",
      "Керемет, осылай жалғастыр!",
      "Жақсы жұмыс, дұрыс!",
      "Өте дұрыс, жарайсың!",
      "Табысты, осылай жалғастыр!",
    ];
    const random = Math.floor(Math.random() * feedbacks.length);
    return feedbacks[random];
  } else {
    const feedbacks = [
      "Ты ответил правильно, так держать!",
      "Правильно, молодец!",
      "Отлично, правильно!",
      "Замечательно, верный ответ!",
      "Классно, так держать!",
      "Хорошая работа, правильно!",
      "Верно, молодец!",
      "Успешно, продолжай в том же духе!",
    ];
    const random = Math.floor(Math.random() * feedbacks.length);
    return feedbacks[random];
  }
}

export { getPositiveFeedback };

function getNegativeFeedback(): string {
  const lang = Cookies.get("locale");
  if (lang === "kk") {
    const feedbacks = [
      "Кешіріңіз, бұл дұрыс жауап емес.",
      "Жауап қате.",
      "Бұл дұрыс емес.",
      "Кешіріңіз, жауап дұрыс емес.",
      "Жауап қате болды.",
      "Бұл дұрыс жауап емес.",
      "Кешіріңіз, қате.",
      "Жауап дұрыс емес.",
    ];
    const random = Math.floor(Math.random() * feedbacks.length);
    return feedbacks[random];
  } else {
    const feedbacks = [
      "Извините, это неверный ответ.",
      "Ответ неверный.",
      "Это неправильно.",
      "Извините, ответ неверный.",
      "Ответ был неправильным.",
      "Это неверный ответ.",
      "Извините, неправильно.",
      "Ответ неверный.",
    ];
    const random = Math.floor(Math.random() * feedbacks.length);
    return feedbacks[random];
  }
}

export { getNegativeFeedback };
