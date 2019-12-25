package libs.espressif.collection;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.ListIterator;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import libs.espressif.function.EspBoolFunction;

public class EspList<E> extends EspCollection<E> implements List<E> {
    private final List<E> mImpl;

    public EspList() {
        this(new ArrayList<>());
    }

    public EspList(@Nonnull List<E> list) {
        super(list);
        mImpl = list;
    }

    @Override
    public boolean addAll(int index, @Nonnull Collection<? extends E> c) {
        return mImpl.addAll(index, c);
    }

    @Override
    public E get(int index) {
        return mImpl.get(index);
    }

    @Override
    public E set(int index, E element) {
        return mImpl.set(index, element);
    }

    @Override
    public void add(int index, E element) {
        mImpl.add(index, element);
    }

    @Override
    public E remove(int index) {
        return mImpl.remove(index);
    }

    @Override
    public int indexOf(@Nullable Object o) {
        return mImpl.indexOf(o);
    }

    public int indexOf(EspBoolFunction<E> function) {
        return EspCollections.index(mImpl, function);
    }

    @Override
    public int lastIndexOf(@Nullable Object o) {
        return mImpl.lastIndexOf(o);
    }

    @Nonnull
    @Override
    public ListIterator<E> listIterator() {
        return mImpl.listIterator();
    }

    @Nonnull
    @Override
    public ListIterator<E> listIterator(int index) {
        return mImpl.listIterator(index);
    }

    @Nonnull
    @Override
    public List<E> subList(int fromIndex, int toIndex) {
        return mImpl.subList(fromIndex, toIndex);
    }
}
