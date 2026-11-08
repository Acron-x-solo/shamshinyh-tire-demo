import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Expand, X } from "lucide-react";
import { photos } from "../data/photos.js";
import { business } from "../data/business.js";
import Photo from "./Photo.jsx";
import Reveal from "./Reveal.jsx";
import { keepDialogFocus } from "./dialogFocus.js";

const captions = [
  "Мастерская на Шамшиных",
  "Навстречу новому сезону",
  "Колесо на балансировке",
  "Комплекты в работе",
  "Мастер за работой",
  "Детали твоего маршрута",
  "Вход в мастерскую",
  "Шиномонтажный станок",
  "Балансировочный станок",
  "Внимание к дискам",
  "Грузы и детали",
  "Шина и диск",
];
export default function Gallery() {
  const dialog = useRef(null);
  const opener = useRef(null);
  const [active, setActive] = useState(0);
  const previousOverflow = useRef("");
  const photo = photos[active];
  const move = (direction) =>
    setActive(
      (current) => (current + direction + photos.length) % photos.length,
    );
  const open = (index, event) => {
    setActive(index);
    opener.current = event.currentTarget;
    previousOverflow.current = document.body.style.overflow;
    dialog.current.showModal();
    document.body.style.overflow = "hidden";
  };
  const close = () => dialog.current.close();
  const onClose = () => {
    document.body.style.overflow = previousOverflow.current;
    opener.current?.focus({ preventScroll: true });
  };
  return (
    <section id="gallery" className="container section-pad gallery-section">
      <Reveal className="section-heading">
        <div>
          <span className="eyebrow">МАСТЕРСКАЯ КРУПНЫМ ПЛАНОМ</span>
          <h2>
            Место. Люди.
            <br />
            <span>Настоящая работа.</span>
          </h2>
        </div>
        <p>
          12 фотографий из карточки мастерской.
          <br />
          Посмотри, куда приедет твой комплект.
        </p>
      </Reveal>
      <div className="photo-grid">
        {photos.map((item, index) => (
          <Reveal
            className={`gallery-item gallery-item-${index}`}
            key={item.src}
          >
            <button
              type="button"
              className="gallery-photo-button"
              onClick={(event) => open(index, event)}
              aria-label={`Открыть фото: ${captions[index]}`}
            >
              <Photo src={item.src} alt={captions[index]} />
              <span className="gallery-photo-shade" />
              <span className="photo-expand">
                <Expand size={18} />
              </span>
              <span className="photo-caption">
                {captions[index]}
                <small>2ГИС · {item.attribution}</small>
              </span>
            </button>
          </Reveal>
        ))}
      </div>
      <div className="gallery-bottom">
        <span>Полный кадр, источник и автор — при открытии фотографии.</span>
        <a
          className="button button-soft"
          href={business.gallery}
          target="_blank"
          rel="noreferrer"
        >
          Все 55 фото в 2ГИС
          <ArrowUpRight size={18} />
        </a>
      </div>
      <dialog
        ref={dialog}
        className="photo-lightbox"
        aria-labelledby="gallery-dialog-title"
        onClose={onClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          keepDialogFocus(event);
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        <div className="lightbox-content">
          <div className="lightbox-top">
            <h2 id="gallery-dialog-title">Фотографии мастерской</h2>
            <span className="lightbox-counter">
              {String(active + 1).padStart(2, "0")} / {photos.length}
            </span>
            <button
              className="icon-button"
              type="button"
              autoFocus
              aria-label="Закрыть фотографии"
              onClick={close}
            >
              <X size={22} />
            </button>
          </div>
          <div className="lightbox-image">
            <Photo
              key={photo.src}
              src={photo.src}
              alt={captions[active]}
              loading="eager"
            />
          </div>
          <div className="lightbox-bottom">
            <div>
              <strong>{captions[active]}</strong>
              <a href={photo.source} target="_blank" rel="noreferrer">
                Фото: {photo.author} · 2ГИС
                <ArrowUpRight size={13} />
              </a>
            </div>
            <div className="lightbox-nav">
              <button
                className="icon-button"
                type="button"
                aria-label="Предыдущее фото"
                onClick={() => move(-1)}
              >
                <ArrowLeft size={20} />
              </button>
              <button
                className="icon-button"
                type="button"
                aria-label="Следующее фото"
                onClick={() => move(1)}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
}
