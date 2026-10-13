import { Component } from "react";
import StatusScreen from "./StatusScreen";
import { t } from "../i18n";

// Перехватывает ошибки рендера и показывает экран ошибки вместо белого экрана
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Причина — только в консоль разработчика
    console.error("Необработанная ошибка рендера:", error, info);
  }

  handleReload = () => {
    // Восстановление — полная перезагрузка приложения
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <StatusScreen
          variant="generic"
          title={t("Что-то пошло не так")}
          text={t("Приложение споткнулось на неожиданной ошибке. Попробуй перезайти — обычно это помогает.")}
          actionLabel={t("Перезагрузить")}
          onAction={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}
