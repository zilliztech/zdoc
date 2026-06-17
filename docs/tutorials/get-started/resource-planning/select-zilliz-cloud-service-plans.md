---
title: "Deployment and Plan Comparison | Cloud"
slug: /select-zilliz-cloud-service-plans
sidebar_key: select-zilliz-cloud-service-plans
sidebar_label: "Deployment and Plan"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud offers multiple deployment and project plan options to match different workload, reliability, compliance, data sovereignty, and infrastructure requirements. | Cloud"
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster plan

---

import Admonition from '@theme/Admonition';


# Deployment and Plan Comparison

Zilliz Cloud offers multiple deployment and project plan options to match different workload, reliability, compliance, data sovereignty, and infrastructure requirements.

Before deploying any resources, you need to first decide whether to use **SaaS** or **BYOC**. This determines who operates the infrastructure and where the data-plane environment runs.

- If you choose SaaS, you then select a project plan that defines the features, SLA, and compliance capabilities available to resources in that project.

- If you choose BYOC, feature support aligns with the SaaS Business Critical plan.

Use this guide to compare Zilliz Cloud plans and choose the right plan before [creating a project](./manage-projects#create-a-project).

## Select Deployment (SaaS vs. BYOC)\{#select-deployment-saas-vs-byoc}

<table>
   <tr>
     <th><p><strong>Decision factor</strong></p></th>
     <th><p><strong>Choose SaaS if…</strong></p></th>
     <th><p><strong>Choose BYOC if…</strong></p></th>
   </tr>
   <tr>
     <td><p>Infrastructure ownership</p></td>
     <td><p>You prefer Zilliz to operate the infrastructure.</p></td>
     <td><p>Your organization must own the cloud account, VPC/VNet, and data-plane environment.</p></td>
   </tr>
   <tr>
     <td><p>Data sovereignty</p></td>
     <td><p>Region-level control is enough.</p></td>
     <td><p>Data must stay in your own cloud account.</p></td>
   </tr>
   <tr>
     <td><p>Networking</p></td>
     <td><p>Public endpoint or standard private networking is acceptable.</p></td>
     <td><p>You need customer VPC/VNet-local access and private endpoint patterns.</p></td>
   </tr>
   <tr>
     <td><p>Compliance</p></td>
     <td><p>SaaS plan controls meet your requirements.</p></td>
     <td><p>Your requirements demand customer-controlled infrastructure or stricter cloud governance.</p></td>
   </tr>
   <tr>
     <td><p>Cost model</p></td>
     <td><p>You prefer packaged SaaS billing.</p></td>
     <td><p>You want to combine Zilliz BYOC pricing with your own cloud-provider discounts and commitments.</p></td>
   </tr>
   <tr>
     <td><p>Operations</p></td>
     <td><p>You want the lowest operational burden.</p></td>
     <td><p>You can manage shared cloud, network, storage, and security responsibilities.</p></td>
   </tr>
</table>

## Select Plan\{#select-plan}

If you choose BYOC, you do not need to further choose the plan. The feature support for BYOC is the same as the SaaS Business Critical plan. If you choose SaaS deployment, you need to select a plan from the following options:

- **Standard:** The Standard plan is tailored for non-critical workloads. It is best suited for prototypes and testing environments. See [Zilliz Cloud Pricing](https://zilliz.com/pricing) for details.

- **Enterprise:** The Enterprise plan provides enterprise-grade reliability and controls. It is best suited for production applications. See [Zilliz Cloud Pricing](https://zilliz.com/pricing) for details.

- **Business Critical**: The Business Critical plan is regulated-ready with maximum resilience. It is best suited for healthcare, finance, mission-critical systems. To select the Business Critical plan, [contact sales](http://zilliz.com/contact-sales).

<table>
   <tr>
     <th><p><strong>Feature</strong></p></th>
     <th><p><strong>Standard (SaaS)</strong></p></th>
     <th><p><strong>Enterprise (SaaS)</strong></p></th>
     <th><p><strong>Business Critical (SaaS) and BYOC</strong></p></th>
   </tr>
   <tr>
     <td><p>Uptime SLA</p></td>
     <td><p>--</p></td>
     <td><p>99.95%</p></td>
     <td><ul><li><p>Business Critical: 99.99% (If multi-replica is enabled)</p></li><li><p>BYOC: 99.95%</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./scale-query-cu#manual-scaling">Manual scaling</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Auto-scaling (including <a href="./scale-query-cu#scheduled-scaling">scheduled</a> and <a href="./scale-query-cu#dynamic-scaling">dynamic</a> scaling)</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-replica">Replica</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./global-cluster-explained">Global cluster</a></p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./on-demand-compute">On-demand compute</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><ul><li><p>Business Critical: ✅</p></li><li><p>BYOC: ❌</p></li></ul></td>
   </tr>
   <tr>
     <td><p><a href="./volume">Volume</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./migrations">Migration</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./metrics-and-alerts">Metrics & alerts</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Observability integrations (<a href="./integrate-with-datadog">Datadog</a>, <a href="./prometheus-monitoring">Prometheus</a>)</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-snapshots">Snapshot</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-backup">Basic backup & restore</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">Cross-region backup</a></p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Storage integrations (<a href="./integrate-with-aws-s3">AWS S3</a>, <a href="./integrate-with-gcp">Google Cloud Storage</a>, <a href="./integrate-with-azure-blob-storage">Azure Blob Storage</a>)</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./access-control-overview">Role-based access control (RBAC)</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./single-sign-on">Single sign-on (SSO)</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-console-ip-allowlist">Console IP allowlist</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-whitelist">Cluster IP allowlist</a></p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./setup-a-private-link">Private endpoints</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./cmek">Customer-managed encryption key (CMEK)</a></p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./auditing">Audit logs</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p><a href="./access-logs">Access logs</a></p></td>
     <td><p>❌</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>
