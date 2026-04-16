export interface AIModel {
    id: string;
    name: string;
    provider: string;
    is_active: boolean;
    context_window: number;
    max_output_tokens: number;
    created_at: string;
}

export interface AIModelListParams {
    skip?: number;
    limit?: number;
}
