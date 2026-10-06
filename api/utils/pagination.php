<?php
/**
 * Pagination Utility
 */

class Pagination {
    /**
     * Get pagination data
     */
    public static function getPagination($page, $perPage, $total) {
        $page = max(1, (int)$page);
        $perPage = max(1, min(100, (int)$perPage)); // Max 100 per page
        $total = max(0, (int)$total);
        
        $totalPages = ceil($total / $perPage);
        $page = min($page, max(1, $totalPages));
        
        $offset = ($page - 1) * $perPage;
        
        return [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'total_pages' => $totalPages,
            'offset' => $offset,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1
        ];
    }
    
    /**
     * Apply LIMIT and OFFSET to query
     */
    public static function applyLimit($query, $page, $perPage) {
        $pagination = self::getPagination($page, $perPage, 0);
        return $query . " LIMIT {$pagination['per_page']} OFFSET {$pagination['offset']}";
    }
}

