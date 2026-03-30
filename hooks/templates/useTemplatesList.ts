import { useState, useEffect } from 'react';
import axios from '@/services/api';
import type { Template, TemplateListItem, UseTemplatesListReturn } from '@/types/template.d';

const useTemplatesList = (): UseTemplatesListReturn => {
    const [templates, setTemplates] = useState<TemplateListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('/api/templates');
            const templatesData: Template[] = response.data;

            // Transform to UI list items
            const listItems: TemplateListItem[] = templatesData.map((template) => ({
                id: template.id,
                name: template.templateName,
                paperSize: template.paperSize,
                orientation: template.orientation,
                isDefault: template.isDefault,
                createdAt: template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '',
                raw: template,
            }));

            setTemplates(listItems);
        } catch (err: any) {
            console.error('Error fetching templates:', err);
            setError(err.response?.data?.message || 'Failed to fetch templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return {
        templates,
        loading,
        error,
        refetch: fetchTemplates,
    };
};

export default useTemplatesList;
