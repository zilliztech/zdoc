## Loading behaviors

Although the same load request applies to both external and managed collections, the strategy for loading external collections depends on the target architecture:

| Environment | Memory Behavior | Execution Detail |
| --- | --- | --- |
| Managed collections in serving clusters | Full load | Loads all indexes and data (vector and scalar fields) directly into memory for high-performance access. |
| External collections in standalone databases | Index-only load | Loads only the indexes into memory. Raw data is retrieved from disk on demand during active searches or queries. |
