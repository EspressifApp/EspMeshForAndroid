package libs.espressif.collection;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import libs.espressif.function.EspBiConsumer;
import libs.espressif.function.EspBoolFunction;
import libs.espressif.function.EspConsumer;
import libs.espressif.function.EspFunction;

public class EspCollections {
    public static <V, K> Map<K, List<V>> groupBy(Collection<? extends V> collection, EspFunction<V, K> function) {
        Map<K, List<V>> result = new HashMap<>();
        for (V v : collection) {
            K key = function.apply(v);
            List<V> list = result.get(key);
            if (list == null) {
                list = new ArrayList<>();
                result.put(key, list);
            }

            list.add(v);
        }

        return result;
    }

    public static <E> int index(List<? extends E> list, EspBoolFunction<E> function) {
        int index = 0;
        for (E e : list) {
            if (function.apply(e)) {
                return index;
            }

            ++index;
        }

        return -1;
    }

    public static <K, V> void forEach(Map<? extends K, ? extends V> map, EspBiConsumer<K, V> consumer) {
        for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
            consumer.accept(entry.getKey(), entry.getValue());
        }
    }

    public static <E> void forEach(Collection<? extends E> collection, EspConsumer<E> consumer) {
        for (E e : collection) {
            consumer.accept(e);
        }
    }
}
