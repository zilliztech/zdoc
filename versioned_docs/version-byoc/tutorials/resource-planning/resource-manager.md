---
slug: /resource-manager
beta: FALSE
notebook: FALSE
type: origin
token: HLkQwRiK2i6dFukrOB2cRdFTnR7
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Resource Manager

The __Resource Manager__ is pivotal for monitoring your Bring Your Own Cloud (BYOC) resources. This module ensures you have complete visibility and control over the cloud resources within your infrastructure.

## Monitor cloud resources{#monitor-cloud-resources}

On the __Resources__ tab in the __Resource Manager__, view the list of cloud services powering your BYOC cluster, including virtual machines (e.g., __m6i.2xlarge__), storage volumes, load balancers, etc.

In the Zilliz Cloud console, each resource is sorted by cloud region. By clicking the links next to each resource, you can directly access the web console of your cloud service provider.

<Admonition type="info" icon="📘" title="Notes">

<p>All resources used for Zilliz Cloud services will be tagged with <strong>byoc</strong>, making it easy for you to quickly locate and manage them.</p>

</Admonition>

![resource_manager_1](/byoc/resource_manager_1.png)

## Oversee service components{#oversee-service-components}

On the __Service Components__ tab in the __Resource Manager__, view service components deployed on your infrastructure, including the instances running each component, CPU core consumption, and sub-service components.

- __Control Components__: Crucial for cloud operations, encompassing monitoring, Kubernetes system processes, data access services, and Milvus operator components.

- __Data Service__: Manages data operations, including proxy nodes, query nodes, coordinators, and data nodes.

- __Dependent Service__: Auxiliary services like metadata services and messaging queues that support other components.

For in-depth information on each component, refer to [BYOC Components (Dev)](./byoc-components).

![resource_manager_2](/byoc/resource_manager_2.png)

## Related topics{#related-topics}

- [License](./license)

- [BYOC Components (Dev)](./byoc-components)

- [Create Cluster (Dev)](./create-cluster)

