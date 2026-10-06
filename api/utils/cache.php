<?php
/**
 * Simple Cache System using Database
 * Can be upgraded to Redis/Memcached later
 */

require_once __DIR__ . '/../config.php';

class Cache {
    private static $conn = null;
    private static $defaultTTL = 3600; // 1 hour
    
    private static function getConnection() {
        if (self::$conn === null) {
            self::$conn = getDBConnection();
        }
        return self::$conn;
    }
    
    /**
     * Get cached value
     */
    public static function get($key) {
        try {
            $conn = self::getConnection();
            $stmt = $conn->prepare(
                "SELECT cache_value FROM cache 
                 WHERE cache_key = ? AND expires_at > NOW()"
            );
            $stmt->bind_param("s", $key);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                return json_decode($row['cache_value'], true);
            }
            
            return null;
        } catch (Exception $e) {
            error_log("Cache::get error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Set cached value
     */
    public static function set($key, $value, $ttl = null) {
        try {
            if ($ttl === null) {
                $ttl = self::$defaultTTL;
            }
            
            $conn = self::getConnection();
            $expiresAt = date('Y-m-d H:i:s', time() + $ttl);
            $valueJson = json_encode($value);
            
            $stmt = $conn->prepare(
                "INSERT INTO cache (cache_key, cache_value, expires_at) 
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 cache_value = VALUES(cache_value),
                 expires_at = VALUES(expires_at)"
            );
            $stmt->bind_param("sss", $key, $valueJson, $expiresAt);
            $stmt->execute();
            
            return true;
        } catch (Exception $e) {
            error_log("Cache::set error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete cached value
     */
    public static function delete($key) {
        try {
            $conn = self::getConnection();
            $stmt = $conn->prepare("DELETE FROM cache WHERE cache_key = ?");
            $stmt->bind_param("s", $key);
            $stmt->execute();
            return true;
        } catch (Exception $e) {
            error_log("Cache::delete error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clear all expired cache
     */
    public static function clearExpired() {
        try {
            $conn = self::getConnection();
            $conn->query("DELETE FROM cache WHERE expires_at < NOW()");
            return true;
        } catch (Exception $e) {
            error_log("Cache::clearExpired error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clear all cache
     */
    public static function clear() {
        try {
            $conn = self::getConnection();
            $conn->query("TRUNCATE TABLE cache");
            return true;
        } catch (Exception $e) {
            error_log("Cache::clear error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Generate cache key
     */
    public static function key(...$parts) {
        return md5(implode(':', $parts));
    }
}

