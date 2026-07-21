package com.kev.backend.session;

/** Aggregate count keyed by exam session, used to avoid per-card count queries. */
public record SessionCount(Long sessionId, long count) {}
