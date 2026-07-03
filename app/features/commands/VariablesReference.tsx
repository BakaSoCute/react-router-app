import { useState } from "react";
import s from "~/routes/_auth.add-bot/CustomCommandsPanel.module.css";
import {
  COMMAND_VARIABLE_GROUPS,
  type CommandVariableGroup,
  type CommandVariableItem,
} from "~/features/commands/commandVariables";
export function VariablesReference() {
  const [open, setOpen] = useState(false);

  return (
    <div className={s.varsBlock}>
      <button type="button" className={s.varsToggle} onClick={() => setOpen((v) => !v)}>
        {open ? "Скрыть справочник переменных" : "Справочник переменных — что подставится в текст"}
      </button>
      {open && (
        <div className={s.varsDetails}>
          <p className={s.muted}>
            Переменные пишутся в ответе команды или в авто-сообщении как <code className={s.code}>$(имя)</code>.
            В авто-сообщениях поля вроде <code className={s.code}>$(user)</code> и <code className={s.code}>$(query)</code>{" "}
            пустые — нет того, кто вызвал команду. Список зрителей для <code className={s.code}>$(randomuser)</code>{" "}
            собирается за текущий эфир и сбрасывается после окончания стрима.
          </p>
          {COMMAND_VARIABLE_GROUPS.map((group: CommandVariableGroup) => (
            <div key={group.title} className={s.varGroup}>
              <p className={s.varGroupTitle}>{group.title}</p>
              <ul className={s.varList}>
                {group.items.map((item: CommandVariableItem) => (                  <li key={item.code} className={s.varItem}>
                    <p className={s.varItemHead}>
                      <code className={s.code}>{item.code}</code>
                      <span className={s.varItemLabel}>{item.label}</span>
                    </p>
                    <p className={s.varItemDesc}>{item.description}</p>
                    {item.example ? (
                      <p className={s.varItemExample}>
                        Пример: <span>{item.example}</span>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
