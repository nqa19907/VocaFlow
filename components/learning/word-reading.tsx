type WordReadingProps = {
  reading: string;
  locale: string;
  className?: string;
};

/** Written pronunciation stays separate from the native text sent to speech synthesis. */
export function WordReading({ reading, locale, className = "" }: WordReadingProps) {
  const language = locale.toLowerCase().split("-")[0];
  const label = language === "en" ? "IPA · Mỹ" : language === "zh" ? "Pinyin" : "Latin";
  const readingLanguage = language === "en" ? "en-fonipa" : `${language}-Latn`;

  return (
    <span className={`word-reading ${className}`.trim()}>
      <span className="word-reading-label">{label}</span>
      <span className="word-reading-text" lang={readingLanguage}>
        {reading}
      </span>
    </span>
  );
}
