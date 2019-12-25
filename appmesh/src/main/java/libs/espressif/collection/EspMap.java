package libs.espressif.collection;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import libs.espressif.function.EspBiConsumer;

public class EspMap<K, V> implements Map<K, V> {
    private final Map<K, V> mImpl;

    public EspMap() {
        this(new HashMap<>());
    }

    public EspMap(@Nonnull Map<K, V> map) {
        mImpl = map;
    }

    @Override
    public int size() {
        return mImpl.size();
    }

    @Override
    public boolean isEmpty() {
        return mImpl.isEmpty();
    }

    @Override
    public boolean containsKey(@Nullable Object key) {
        return mImpl.containsKey(key);
    }

    @Override
    public boolean containsValue(@Nullable Object value) {
        return mImpl.containsValue(value);
    }

    @Nullable
    @Override
    public V get(@Nullable Object key) {
        return mImpl.get(key);
    }

    @Nullable
    @Override
    public V put(@Nonnull K key, @Nonnull V value) {
        return mImpl.put(key, value);
    }

    @Nullable
    @Override
    public V remove(@Nullable Object key) {
        return mImpl.remove(key);
    }

    @Override
    public void putAll(@Nonnull Map<? extends K, ? extends V> m) {
        mImpl.putAll(m);
    }

    @Override
    public void clear() {
        mImpl.clear();
    }

    @Nonnull
    @Override
    public Set<K> keySet() {
        return mImpl.keySet();
    }

    @Nonnull
    @Override
    public Collection<V> values() {
        return mImpl.values();
    }

    @Nonnull
    @Override
    public Set<Entry<K, V>> entrySet() {
        return mImpl.entrySet();
    }

    public void foreach(EspBiConsumer<K, V> consumer) {
        EspCollections.forEach(mImpl, consumer);
    }
}
