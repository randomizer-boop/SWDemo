import { useCallback, useState } from "react";
import ChartWheel from "./ChartWheel";
import ChartViewer from "./ChartViewer";
import Icon from "./Icon";
import { t } from "../i18n";
import "./ExpandableWheel.css";

// Колесо карты, которое по нажатию открывается на весь экран (ChartViewer).
// Значок в углу подсказывает, что карту можно раскрыть.
export default function ExpandableWheel({ chart, size }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className="xw-open"
        onClick={() => setOpen(true)}
        aria-label={t("Открыть карту на весь экран")}
      >
        <ChartWheel chart={chart} size={size} />
        <span className="xw-badge" aria-hidden="true">
          <Icon name="expand" strokeWidth={2} />
        </span>
      </button>
      {open && <ChartViewer chart={chart} onClose={close} />}
    </>
  );
}
