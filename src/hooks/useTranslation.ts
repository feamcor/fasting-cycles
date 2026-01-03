import { useSettingsStore } from '../store/useSettingsStore';
import type { TranslationKey } from '../i18n/translations';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
    const language = useSettingsStore((state) => state.language);

    const t = (key: TranslationKey): string => {
        const lang = language || 'pt_BR'; // Fallback to pt_BR if something goes wrong, though store defaults correctly
        return translations[lang][key] || key;
    };

    return { t, language };
};
