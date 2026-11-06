/**
 * Vertrag für jede Datenquelle (Fake-Daten oder Wiener Linien).
 *
 * @typedef {Object} DataSource
 * @property {() => Promise<Object[]>} getMessages
 *   Liefert pro Haltestelle (RBL) eine Nachricht im Originalformat der
 *   Wiener-Linien-Monitor-Antwort (data.monitors und message).
 *   Einzige Abweichung: pro Linie höchstens zwei Abfahrten statt zehn.
 */
export {};