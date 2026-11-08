import { lazy, Suspense, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CircleDot,
  Clock3,
  MapPin,
  Menu,
  X,
  Phone,
  Star,
  Check,
  CircleDashed,
  Warehouse,
  Disc3,
  Navigation,
  CreditCard,
} from "lucide-react";
import { motion } from "motion/react";
import { business, services } from "./data/business.js";
import Reveal from "./components/Reveal.jsx";
import Photo from "./components/Photo.jsx";
import Gallery from "./components/Gallery.jsx";
import Prices from "./components/Prices.jsx";
import SceneBoundary from "./components/SceneBoundary.jsx";
const WheelScene = lazy(() => import("./components/WheelScene.jsx"));
const links = [
  { id: "services", label: "Услуги" },
  { id: "prices", label: "Цены" },
  { id: "gallery", label: "Фотографии" },
  { id: "contacts", label: "Контакты" },
];

function Brand() {
  return (
    <a
      className="brand"
      href="#home"
      aria-label="Шиномонтаж на Шамшиных — главная"
    >
      <span className="brand-symbol">
        <CircleDot size={29} strokeWidth={1.8} />
      </span>
      <span>
        ШИНОМОНТАЖ<small>ШАМШИНЫХ / 93А</small>
      </span>
    </a>
  );
}
function Book({ children = "Записаться", className = "button button-blue" }) {
  return (
    <a className={className} href="#contacts">
      {children}
      <ArrowUpRight size={19} />
    </a>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-row">
        <Brand />
        <nav className="desktop-nav" aria-label="Основная навигация">
          {links.map((link) => (
            <a href={`#${link.id}`} key={link.id}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-phone" href={business.phoneLink}>
            {business.phone}
          </a>
          <Book />
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="container mobile-menu"
          aria-label="Мобильная навигация"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              document.querySelector(".menu-toggle").focus();
            }
          }}
        >
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
              <ArrowUpRight size={18} />
            </a>
          ))}
          <a href={business.phoneLink}>
            Позвонить
            <Phone size={18} />
          </a>
        </nav>
      )}
    </header>
  );
}
function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="status-dot" />
            ШИНОМОНТАЖ В ЦЕНТРЕ НОВОСИБИРСКА
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
          >
            ВСЁ НА
            <br />
            <em>КОЛЁСАХ.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            Смена шин, ремонт и хранение комплекта.
            <br />
            Заботимся о колёсах — ты строишь планы.
          </motion.p>
          <div className="hero-actions">
            <Book>Записаться в мастерскую</Book>
            <a className="hero-explore" href="#services">
              Посмотреть услуги
              <ArrowDown size={17} />
            </a>
          </div>
          <div className="hero-tags">
            <span>
              <CircleDot size={15} />
              Шины
            </span>
            <span>
              <Disc3 size={15} />
              Диски
            </span>
            <span>
              <Warehouse size={15} />
              Хранение
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="wheel-stage" aria-hidden="true">
            <span className="stage-address">
              93<span>А</span>
            </span>
            <span className="stage-word">ШАМШИНЫХ</span>
            <span className="stage-track" />
          </div>
          <div className="scene-caption">
            <span className="status-dot" />
            ВСЯ СУТЬ — В ДЕТАЛЯХ
          </div>
          <SceneBoundary>
            <Suspense
              fallback={
                <div className="scene-loading">
                  <CircleDot size={130} />
                  <span>Готовим колесо</span>
                </div>
              }
            >
              <WheelScene />
            </Suspense>
          </SceneBoundary>
          <span className="scene-sticker" aria-hidden="true">
            <ArrowUpRight size={20} />
            ВРАЩАЙ.
            <br />
            ИССЛЕДУЙ.
          </span>
        </div>
      </div>
      <div className="container hero-info">
        <a href={business.map} target="_blank" rel="noreferrer">
          <MapPin size={23} />
          <span>
            {business.address}
            <small>{business.district}</small>
          </span>
          <ArrowUpRight size={17} />
        </a>
        <div>
          <Clock3 size={23} />
          <span>
            {business.hours}
            <small>Каждый день</small>
          </span>
        </div>
        <a href={business.reviews} target="_blank" rel="noreferrer">
          <Star size={23} />
          <span>
            {business.rating} в 2ГИС<small>{business.ratings} оценки</small>
          </span>
          <ArrowUpRight size={17} />
        </a>
      </div>
    </section>
  );
}
function Services() {
  const [active, setActive] = useState(0);
  const service = services[active];
  return (
    <section id="services" className="container section-pad">
      <Reveal className="section-heading">
        <div>
          <span className="eyebrow">ПОМОГАЕМ ТВОЕМУ КОМПЛЕКТУ</span>
          <h2>
            Сезон меняется.
            <br />
            <span>Курс остаётся.</span>
          </h2>
        </div>
        <p>
          Повседневный сервис для шин и дисков.
          <br />
          Выбери задачу — узнай, чем можем помочь.
        </p>
      </Reveal>
      <Reveal className="service-panel">
        <div className="service-tabs" role="group" aria-label="Выбрать услугу">
          {services.map((item, index) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              {item.short}
              {active === index ? (
                <ArrowUpRight size={17} />
              ) : (
                <ArrowRight size={17} />
              )}
            </button>
          ))}
        </div>
        <div className="service-panel-body">
          <div className="service-photo">
            <Photo
              key={service.photo}
              src={service.photo}
              alt={`Фотография мастерской: ${service.name}`}
            />
            <span className="photo-source">РЕАЛЬНАЯ МАСТЕРСКАЯ / 2ГИС</span>
            <span className="service-photo-label">
              НА ШАМШИНЫХ.
              <br />
              НА ТВОЁМ МАРШРУТЕ.
            </span>
          </div>
          <div className="service-copy" aria-live="polite">
            <span className="eyebrow">{service.tag}</span>
            <h3>{service.name}</h3>
            <p>{service.text}</p>
            <ul>
              {service.bullets.map((bullet) => (
                <li key={bullet}>
                  <Check size={16} />
                  {bullet}
                </li>
              ))}
            </ul>
            <a className="button button-blue" href="#prices">
              Посмотреть стоимость
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </Reveal>
      <Reveal className="service-footer-note">
        <CircleDashed size={25} />
        <p>
          Каждое колесо требует своего подхода.
          <span>Объём работ и состояние комплекта обсудим перед визитом.</span>
        </p>
        <Book className="button button-soft">Обсудить задачу</Book>
      </Reveal>
    </section>
  );
}
function WorkshopFeature() {
  return (
    <section className="photo-feature">
      <Photo
        src="/images/workshop-exterior.webp"
        alt="Настоящая шиномонтажная мастерская на Семьи Шамшиных, 93а"
      />
      <span className="feature-shade" />
      <div className="container feature-content">
        <Reveal>
          <span className="eyebrow">СЕМЬИ ШАМШИНЫХ / 93А</span>
          <h2>
            Заезжай.
            <br />
            Дальше —<br />
            <span>твоя дорога.</span>
          </h2>
          <a className="button button-white" href="#contacts">
            Контакты и маршрут
            <ArrowUpRight size={19} />
          </a>
        </Reveal>
        <div className="feature-location">
          <MapPin size={29} />
          <strong>
            В центре
            <br />
            твоих планов.
          </strong>
          <span>Новосибирск · Центральный район</span>
        </div>
      </div>
      <span className="feature-source">
        Фотография из карточки мастерской в 2ГИС
      </span>
    </section>
  );
}
function Faq() {
  const items = [
    {
      title: "Как записаться?",
      text: "Нажми «Записаться» и выбери номер в контактах. По телефону согласуй услугу и удобное время. Запись подтверждает мастерская.",
    },
    {
      title: "Как узнать точную стоимость?",
      text: "Прайс из карточки 2ГИС показан выше. Итог зависит от размера колёс, состояния шин и нужных работ. Актуальную стоимость подтвердит мастерская перед визитом.",
    },
    {
      title: "Можно оставить шины на хранение?",
      text: "Хранение шин указано в карточке мастерской. Свободное место, срок, условия и стоимость уточни по телефону.",
    },
    {
      title: "Какие способы оплаты доступны?",
      text: "В 2ГИС указаны наличные, оплата картой и перевод с карты. Удобный способ оплаты можно согласовать при записи.",
    },
  ];
  return (
    <section className="container section-pad faq-section">
      <Reveal className="faq-intro">
        <span className="eyebrow">ПЕРЕД ПЕРВОЙ ПОЕЗДКОЙ</span>
        <h2>
          Есть вопрос?
          <br />
          <span>Есть ответ.</span>
        </h2>
        <a href={business.phoneLink} className="text-link">
          Спросить у мастера
          <Phone size={17} />
        </a>
      </Reveal>
      <Reveal className="faq-list">
        {items.map((item) => (
          <details key={item.title}>
            <summary>
              {item.title}
              <span>+</span>
            </summary>
            <p>{item.text}</p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
function Contacts() {
  return (
    <section id="contacts" className="contacts-section">
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <span className="eyebrow">УВИДИМСЯ НА ШАМШИНЫХ</span>
            <h2>
              Твой следующий
              <br />
              <span>поворот — сюда.</span>
            </h2>
          </div>
          <p>
            Позвони, согласуй время и приезжай.
            <br />
            Каждый день с {business.hours}.
          </p>
        </Reveal>
        <Reveal className="contact-grid">
          <div className="contact-main">
            <span className="eyebrow">ЗАПИСЬ И ВОПРОСЫ</span>
            <a className="contact-phone" href={business.phoneLink}>
              {business.phone}
              <ArrowUpRight size={31} />
            </a>
            <a className="contact-secondary" href={business.secondPhoneLink}>
              Второй номер: {business.secondPhone}
              <ArrowUpRight size={16} />
            </a>
            <div className="contact-buttons">
              <a className="button button-white" href={business.phoneLink}>
                Позвонить в мастерскую
                <Phone size={18} />
              </a>
              <a
                className="button button-line-white"
                href={business.map}
                target="_blank"
                rel="noreferrer"
              >
                Построить маршрут
                <Navigation size={18} />
              </a>
            </div>
            <div className="contact-details">
              <span>
                <Clock3 size={18} />
                {business.hours} · ежедневно
              </span>
              <span>
                <CreditCard size={18} />
                Наличные · карта · перевод
              </span>
            </div>
          </div>
          <div className="contact-location">
            <div className="location-address">
              <MapPin size={25} />
              <span>
                <strong>{business.address}</strong>
                <small>
                  {business.city} · {business.district}
                </small>
              </span>
            </div>
            <Photo
              src="/images/workshop-exterior.webp"
              alt="Павильон мастерской на Семьи Шамшиных, 93а"
            />
            <a href={business.map} target="_blank" rel="noreferrer">
              Открыть точку в 2ГИС
              <ArrowUpRight size={20} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer className="container site-footer">
      <Brand />
      <span>Демонстрационная концепция сайта</span>
      <a href={business.map} target="_blank" rel="noreferrer">
        Информация и фото: 2ГИС
        <ArrowUpRight size={14} />
      </a>
    </footer>
  );
}
export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Перейти к содержимому
      </a>
      <div id="home" />
      <Header />
      <main id="main">
        <Hero />
        <Services />
        <WorkshopFeature />
        <Prices />
        <Gallery />
        <Faq />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
