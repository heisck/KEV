package com.kev.backend.directory;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.cache.annotation.Cacheable;

class DirectoryCacheContractTest {

    @Test
    void emptyDirectoryLookupsAreNotCached() throws Exception {
        assertEmptyResultCondition(DatabaseUniversityDirectory.class);
        assertEmptyResultCondition(MockUitsDirectory.class);
    }

    private void assertEmptyResultCondition(Class<?> directoryType) throws Exception {
        Cacheable cacheable =
                directoryType.getMethod("findByIndexNumber", String.class).getAnnotation(Cacheable.class);
        assertThat(cacheable.unless()).isEqualTo("#result == null");
    }
}
