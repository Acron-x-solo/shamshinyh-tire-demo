import { useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Copy,
  Expand,
  X,
  Disc3,
} from "lucide-react";
import { business } from "../data/business.js";
import {
  vehicles,
  priceServices,
  priceData,
  lookupPublishedRate,
  buildInquiry,
  money,
  diameterLabel,
} from "../data/prices.js";
import Photo from "./Photo.jsx";
import Reveal from "./Reveal.jsx";
import { keepDialogFocus } from "./dialogFocus.js";

export default function Prices() {
  const [vehicle, setVehicle] = useState("sedan");
  const [diameter, setDiameter] = useState(16);
  const [serviceId, setServiceId] = useState("seasonal_replacement");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const dialog = useRef(null);
  const opener = useRef(null);
  const previousOverflow = useRef("");
  const inquiryRevision = useRef(0);
  const rate = lookupPublishedRate({ vehicle, diameter, serviceId });
  const inquiry = buildInquiry({ vehicle, diameter, serviceId });
  const select = (setter, value) => {
    inquiryRevision.current += 1;
    setter(value);
    setCopied(false);
    setCopyFailed(false);
  };
  const copy = async () => {
    const revision = inquiryRevision.current;
    try {
      await navigator.clipboard.writeText(inquiry);
      if (revision !== inquiryRevision.current) return;
      setCopied(true);
      setCopyFailed(false);
    } catch {
      if (revision !== inquiryRevision.current) return;
      setCopyFailed(true);
    }
  };
  const open = (event) => {
    opener.current = event.currentTarget;
    previousOverflow.current = document.body.style.overflow;
    dialog.current.showModal();
    document.body.style.overflow = "hidden";
  };
  const discGroups = [
    ...new Set(priceData.disc_services.rows.map((row) => row.service_id)),
  ];
  return (
    <section id="prices" className="container section-pad prices-section">
      <Reveal className="section-heading">
        <div>
          <span className="eyebrow">ПРАЙС ИЗ МАСТЕРСКОЙ</span>
          <h2>
            Твой комплект.
            <br />
            <span>Твоя стоимость.</span>
          </h2>
        </div>
        <p>
          Цены для разных автомобилей и диаметров.
          <br />
          Условия и актуальность подтвердит мастерская.
        </p>
      </Reveal>
      <Reveal className="price-picker">
        <div className="price-picker-options">
          <fieldset>
            <legend>Что делаем?</legend>
            <div className="pick-service">
              {priceServices.map((service) => (
                <button
                  type="button"
                  key={service.id}
                  aria-pressed={serviceId === service.id}
                  onClick={() => select(setServiceId, service.id)}
                >
                  {service.label}
                  {serviceId === service.id ? (
                    <Check size={17} />
                  ) : (
                    <ArrowRight size={17} />
                  )}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Твой автомобиль</legend>
            <div className="pick-vehicle">
              {vehicles.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={vehicle === item.id}
                  onClick={() => select(setVehicle, item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Диаметр диска</legend>
            <div className="pick-diameter">
              {Array.from({ length: 12 }, (_, i) => i + 13).map((size) => (
                <button
                  type="button"
                  key={size}
                  aria-pressed={diameter === size}
                  onClick={() => select(setDiameter, size)}
                >
                  R{size}
                </button>
              ))}
            </div>
            <button
              className="unknown-size"
              type="button"
              aria-pressed={diameter === "unknown"}
              onClick={() => select(setDiameter, "unknown")}
            >
              {diameter === "unknown" && <Check size={14} />}Не знаю размер
            </button>
          </fieldset>
        </div>
        <aside
          className="price-result"
          aria-label="Цена из опубликованного прайса"
        >
          <div className="price-result-top">
            <span className="eyebrow">ПОД ТВОИ КОЛЁСА</span>
            <Disc3 size={36} strokeWidth={1.2} />
          </div>
          <h3>
            {priceServices.find((service) => service.id === serviceId).label}
          </h3>
          <p className="price-selection" aria-live="polite">
            {vehicles.find((item) => item.id === vehicle).label} ·{" "}
            {diameter === "unknown" ? "Размер уточним" : `R${diameter}`}
          </p>
          <div className="selected-price" aria-live="polite">
            {rate ? (
              <>
                <span>В опубликованном прайсе</span>
                <strong>
                  {money(rate.price_rub)} <small>₽</small>
                </strong>
                <span>
                  {rate.quantity === 4
                    ? "За 4 колеса: грузы и мойка включены"
                    : "Мойка, шиномонтаж, балансировка, грузы и установка"}
                </span>
              </>
            ) : (
              <>
                <span>Для этого сочетания цена не указана</span>
                <strong className="missing-price">
                  Уточним <br />
                  стоимость
                </strong>
                <span>Размер и условия обсудим с мастером</span>
              </>
            )}
          </div>
          <a className="button button-white" href="#contacts">
            Обсудить и записаться
            <ArrowUpRight size={18} />
          </a>
          <button className="copy-inquiry" type="button" onClick={copy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span aria-live="polite">
              {copied ? "Запрос скопирован" : "Скопировать запрос"}
            </span>
          </button>
          {copyFailed && (
            <div className="copy-fallback">
              <label htmlFor="inquiry-text">
                Выдели и скопируй текст запроса
              </label>
              <textarea
                id="inquiry-text"
                className="resize-none"
                rows={9}
                readOnly
                value={inquiry}
                onFocus={(event) => event.currentTarget.select()}
              />
            </div>
          )}
          <p className="price-result-note">
            Это строка из прайса, а не подтверждение записи. Итоговую цену и
            состав работ согласуй с мастерской.
          </p>
        </aside>
      </Reveal>
      <div className="price-source-bar">
        <p>
          <strong>Источник: фотография прайса в 2ГИС.</strong>
          <span>
            Загружена 17.04.2026. Дата действия цен на фото не указана.
          </span>
        </p>
        <button type="button" className="button button-soft" onClick={open}>
          Посмотреть оригинал
          <Expand size={17} />
        </button>
      </div>
      <Reveal className="full-prices-heading">
        <h3>Весь видимый прайс.</h3>
        <p>
          Комплекс — мойка, шиномонтаж, балансировка, грузы и установка.
          <br />
          Количество колёс в строке комплекса не указано — уточни при записи.
        </p>
      </Reveal>
      <div className="vehicle-price-grid">
        {vehicles.map((item) => (
          <Reveal className="vehicle-price-card" key={item.id}>
            <h4>{item.label}</h4>
            <table>
              <caption className="sr-only">
                Цены для автомобиля: {item.label}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Диаметр</th>
                  <th scope="col">Комплекс</th>
                  <th scope="col">
                    Балансировка<small>4 колеса</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {priceData.seasonal_replacement.rows
                  .filter((row) => row.vehicle_type === item.id)
                  .map((row) => {
                    const balance = priceData.balancing.rows.find(
                      (b) =>
                        b.vehicle_type === item.id &&
                        b.diameter_inches.min === row.diameter_inches.min &&
                        b.diameter_inches.max === row.diameter_inches.max,
                    );
                    return (
                      <tr key={row.diameter_inches.min}>
                        <th scope="row">
                          {diameterLabel(row.diameter_inches)}
                        </th>
                        <td className="published-price-cell">
                          {money(row.price_rub)} ₽
                        </td>
                        <td className="published-price-cell">
                          {money(balance.price_rub)} ₽
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <div className="removal-rate">
              <span>
                Снятие и установка
                <br />
                <small>4 колеса</small>
              </span>
              <strong className="published-price-cell">
                {money(
                  priceData.wheel_removal_installation.rows.find(
                    (row) => row.vehicle_type === item.id,
                  ).price_rub,
                )}{" "}
                ₽
              </strong>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="price-condition">
        <span>Условия из прайса</span>
        <p>
          Балансировка: 4 колеса, грузы и мойка. Доплата: «Низкий профиль от 45
          / RUNFLAT + 150 руб. за колесо». В прайсе также указано, что
          мастерская не занимается утилизацией шин.
        </p>
      </Reveal>
      <Reveal className="extras-price-list">
        <h3>Дополнительные работы</h3>
        <div>
          {priceData.extras.map((row) => (
            <div className="extra-price" key={row.service_id}>
              <span>{row.source_label}</span>
              <strong className="published-price-cell">
                {money(row.price_rub)} ₽
              </strong>
            </div>
          ))}
        </div>
        <p>Единица оплаты на снимке не указана. Уточни условия при записи.</p>
      </Reveal>
      <Reveal className="disc-prices-heading">
        <h3>Правка и прокатка дисков</h3>
        <p>
          В таблицах ниже — все читаемые цены нижнего фрагмента прайса.
          <br />
          Снимок обрезан снизу; условия строк со звёздочкой уточни у мастера.
        </p>
      </Reveal>
      <div className="disc-price-grid">
        {discGroups.map((id) => {
          const rows = priceData.disc_services.rows.filter(
            (row) => row.service_id === id,
          );
          return (
            <Reveal className="disc-price-card" key={id}>
              <h4>{rows[0].source_label}</h4>
              <table>
                <caption className="sr-only">{rows[0].source_label}</caption>
                <thead>
                  <tr>
                    <th scope="col">Диаметр</th>
                    <th scope="col">Цена, ₽</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.diameter_inches.min}>
                      <th scope="row">{diameterLabel(row.diameter_inches)}</th>
                      <td className="published-price-cell">
                        {row.price_type === "from" ? "от " : ""}
                        {money(row.price_rub)} ₽
                        {row.needs_confirmation && (
                          <small className="uncertain-price">
                            как напечатано · уточнить
                          </small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {id === "stamped_disc_rolling" && (
                <p>Для R17–24 цена на фото не указана.</p>
              )}
            </Reveal>
          );
        })}
      </div>
      <div className="disc-price-note">
        <p>
          В строке устранения восьмёрки для R18 на фото напечатано{" "}
          <strong>170 ₽</strong>. Значение требует подтверждения в мастерской.
          Единица оплаты работ с дисками на снимке не указана.
        </p>
        <a
          href={business.prices}
          className="text-link"
          target="_blank"
          rel="noreferrer"
        >
          Прайс в 2ГИС
          <ArrowUpRight size={16} />
        </a>
      </div>
      <dialog
        ref={dialog}
        className="photo-lightbox price-lightbox"
        aria-labelledby="price-dialog-title"
        onKeyDown={keepDialogFocus}
        onClose={() => {
          document.body.style.overflow = previousOverflow.current;
          opener.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current.close();
        }}
      >
        <div className="lightbox-content">
          <div className="lightbox-top">
            <h2 id="price-dialog-title">Оригинальный прайс из 2ГИС</h2>
            <button
              className="icon-button"
              autoFocus
              type="button"
              aria-label="Закрыть прайс"
              onClick={() => dialog.current.close()}
            >
              <X size={22} />
            </button>
          </div>
          <div className="lightbox-image">
            <Photo
              src="/images/price-list.webp"
              alt="Все видимые цены на фотографии прайса мастерской"
              loading="eager"
            />
          </div>
          <div className="lightbox-bottom">
            <a
              href={priceData.source.image_url}
              target="_blank"
              rel="noreferrer"
            >
              Открыть файл источника
              <ArrowUpRight size={14} />
            </a>
            <span>Загрузка фото: 17.04.2026</span>
          </div>
        </div>
      </dialog>
    </section>
  );
}
