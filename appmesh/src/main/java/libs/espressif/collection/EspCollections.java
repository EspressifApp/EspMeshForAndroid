package libs.espressif.collection;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import libs.espressif.function.BooleanFunction;
import libs.espressif.function.EspFunction;

public class EspCollections {
    public static <V, K> Map<K, List<V>> groupBy(Collection<V> collection, EspFunction<V, K> function) {
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

    public static <E> int index(List<E> list, BooleanFunction<E> function) {
        int index = 0;
        for (E e : list) {
            if (function.apply(e)) {
                return index;
            }

            ++index;
        }

        return -1;
    }
}
