export interface GBResponse<ResultType> {
    error: string;
    limit: number;
    offset: number;
    number_of_page_results: number;
    number_of_total_results: number;
    status_code: number;
    results: ResultType;
    version: string;
}

export interface GBGame {
    aliases: null | string;
    api_detail_url: string;
    date_added: Date;
    date_last_updated: Date;
    deck: null | string;
    description: null | string;
    expected_release_day: number | null;
    expected_release_month: number | null;
    expected_release_quarter: null;
    expected_release_year: number | null;
    guid: string;
    id: number;
    image: GBImage;
    image_tags: ImageTag[];
    name: string;
    number_of_user_reviews: number;
    original_game_rating: OriginalGameRating[] | null;
    original_release_date: Date | null;
    platforms: Platform[];
    site_detail_url: string;
}

export interface GBImage {
    icon_url: string;
    medium_url: string;
    screen_url: string;
    screen_large_url: string;
    small_url: string;
    super_url: string;
    thumb_url: string;
    tiny_url: string;
    original_url: string;
    image_tags: string;
}

export interface ImageTag {
    api_detail_url: string;
    name: string;
    total: number;
}

export interface OriginalGameRating {
    api_detail_url: string;
    id: number;
    name: string;
}

export interface Platform {
    api_detail_url: string;
    id: number;
    name: string;
    site_detail_url: string;
    abbreviation: string;
}
