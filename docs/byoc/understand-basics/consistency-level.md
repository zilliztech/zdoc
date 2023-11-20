---
slug: /docs/byoc/consistency-level
beta: FALSE
notebook: FALSE
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# Consistency Level

In distributed databases, consistency ensures that every node or replica offers the same data view during read or write operations. Zilliz Cloud provides four consistency levels: **Strong**, **Bounded Staleness**, **Session**, and **Eventually**, with **Bounded Staleness** set as the default.

## Understanding the Balance: The PACELC Theorem{#understanding-the-balance-the-pacelc-theorem}

The PACELC theorem postulates that a distributed database must make trade-offs between consistency, availability, and latency. While high consistency guarantees accurate data, it may come at the cost of longer search latency. Conversely, low consistency offers faster search speeds but may compromise on data accuracy. Thus, the appropriate level of consistency depends on the specific use-case scenario.

- **Strong**
    The strong level is the strictest level ensuring that users always read the most recent data version, and offers the highest accuracy but may lead to increased latency.

    ![Dv6obAFzsorbZtxcTkgcGlnBnWg](/byoc/Dv6obAFzsorbZtxcTkgcGlnBnWg.png)

    This consistency level is best for functional testing and critical applications like online financial systems where data accuracy is paramount.

- **Bounded staleness**
    The bounded staleness level, as its name suggests, permits temporary data inconsistency but typically achieves global consistency after a short period. It offers a balance between latency and accuracy.

    ![Mrx3b9ZxWos0Dgx2nw0ctbzGnyd](/byoc/Mrx3b9ZxWos0Dgx2nw0ctbzGnyd.png)

    Bounded staleness is suitable for systems like video recommendation platforms, where occasional data inconsistencies don't drastically affect performance.

- **Session **
    The session level guarantees immediate data visibility for reads and writes within the same session and ensures a consistent user experience within an active session.

    ![OM9ibCbIboBqjExfchDcvGxJnLI](/byoc/OM9ibCbIboBqjExfchDcvGxJnLI.png)

    We recommend choosing session as the consistency level for those applications like library management systems, ensuring the latest session actions reflect accurately.

- **Eventually**
    The level of eventually indicates the most relaxed level, allowing data to converge to a consistent state over time without strict read-write order.

    ![VlGcbuuLcogaBcxLj85cMmN4n9e](/byoc/VlGcbuuLcogaBcxLj85cMmN4n9e.png)

    It maximizes search performance by sacrificing immediate consistency and therefore is best suitable for the scenarios prioritizing speed over immediate data accuracy, such as displaying product reviews.

## Leveraging Guarantee Timestamp for Consistency{#leveraging-guarantee-timestamp-for-consistency}

To achieve these consistency levels, Zilliz Cloud employs the concept of the [Guarantee Timestamp](https://github.com/milvus-io/milvus/blob/f3f46d3bb2dcae2de0bdb7bc0f7b20a72efceaab/docs/developer_guides/how-guarantee-ts-works.md) (GuaranteeTs). This timestamp informs query nodes to delay searches or queries until all data up to the GuaranteeTs are available for viewing. Depending on the selected consistency level, the GuaranteeTs value adjusts:

- **Strong**: Matches the latest system timestamp, ensuring all data up to this point is visible before queries.

- **Bounded Staleness**: Slightly predates the latest system timestamp, permitting queries on slightly older data.

- **Session**: Uses the timestamp of the client's last write, ensuring visibility of that client's data.

- **Eventually**: Sets a minimal value to bypass consistency checks, enabling immediate queries on available data.

To delve deeper into this mechanism, consult the [How GuaranteeTs Works](https://milvus.io/docs/consistency.md#:~:text=How%20GuaranteeTs%20Works) section for a detailed breakdown of consistency levels.