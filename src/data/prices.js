import priceData from "./price-data.json" with { type: "json" };
export { priceData };
export const vehicles = [
  { id: "sedan", label: "Седан" },
  { id: "crossover", label: "Кроссовер" },
  { id: "jeep", label: "Джип" },
];
export const priceServices = [
  { id: "seasonal_replacement", label: "Сезонный комплекс" },
  { id: "balancing", label: "Балансировка" },
];
export function lookupPublishedRate({ serviceId, vehicle, diameter }) {
  if (
    !priceServices.some((service) => service.id === serviceId) ||
    !vehicles.some((item) => item.id === vehicle) ||
    !Number.isInteger(diameter) ||
    diameter < 13 ||
    diameter > 24
  )
    return null;
  const service = priceData[serviceId];
  const row = service.rows.find(
    (item) =>
      item.vehicle_type === vehicle &&
      diameter >= item.diameter_inches.min &&
      diameter <= item.diameter_inches.max,
  );
  return row
    ? { ...row, unit: service.unit, quantity: service.quantity }
    : null;
}
export function buildInquiry({ serviceId, vehicle, diameter }) {
  const service = priceServices.find((item) => item.id === serviceId);
  const car = vehicles.find((item) => item.id === vehicle);
  if (!service || !car) throw new TypeError("Выбери услугу и тип автомобиля");
  if (
    diameter !== "unknown" &&
    (!Number.isInteger(diameter) || diameter < 13 || diameter > 24)
  )
    throw new TypeError("Выбери диаметр колеса");
  return `Здравствуйте! Хочу уточнить условия и время визита в мастерскую на Шамшиных, 93а. Услуга: ${service.label.toLowerCase()}; автомобиль: ${car.label.toLowerCase()}; ${diameter === "unknown" ? "размер уточню" : `R${diameter}`}. Прошу подтвердить актуальную стоимость, состав работ и удобное время.`;
}
export function money(value) {
  return new Intl.NumberFormat("ru-RU").format(value);
}
export function diameterLabel(range) {
  return range
    ? `R${range.min}${range.max !== range.min ? `–${range.max}` : ""}`
    : "—";
}
