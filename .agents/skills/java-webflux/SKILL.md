---
name: java-webflux
description: 'Build high-performance reactive systems with Spring Boot WebFlux and AI agents.'
---

# Spring Boot WebFlux + AI Agent Best Practices

Your goal is to build scalable, non-blocking, and AI-ready backend systems using Spring Boot WebFlux.

---

# Core Reactive Principles

- **Reactive First:** Use non-blocking APIs end-to-end.
- **Types:**
  - `Mono<T>` → 0..1 result
  - `Flux<T>` → 0..N stream
- **Do not block:** Avoid `.block()` in production code
- **Backpressure:** Always consider data flow control.