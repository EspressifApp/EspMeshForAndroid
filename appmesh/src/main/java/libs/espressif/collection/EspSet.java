package libs.espressif.collection;

import java.util.HashSet;
import java.util.Set;

import javax.annotation.Nonnull;

public class EspSet<E> extends EspCollection<E> implements Set<E>{
    public EspSet() {
        this(new HashSet<>());
    }

    public EspSet(@Nonnull Set<E> set) {
        super(set);
    }
}
