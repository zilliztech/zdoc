---
title: "Shared Responsibilities | BYOC"
slug: /shared-responsibilities
sidebar_label: "Shared Responsibilities"
beta: CONTACT SALES
notebook: FALSE
description: "This page outlines the responsibilities of Zilliz Cloud and BYOC users to clarify the division of tasks related to cloud management, upgrades, security, access control, service availability, and technical support, ensuring smooth collaboration while maintaining a secure and efficient operation environment. | BYOC"
type: origin
token: QqtGwq7lSimnHJk6IuXcM9synWg
sidebar_position: 9
keywords: 
  - zilliz
  - byoc
  - milvus
  - vector database
  - shared responsibilities
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database

---

import Admonition from '@theme/Admonition';


# Shared Responsibilities

This page outlines the responsibilities of Zilliz Cloud and BYOC users to clarify the division of tasks related to cloud management, upgrades, security, access control, service availability, and technical support, ensuring smooth collaboration while maintaining a secure and efficient operation environment.

## Cloud Management{#cloud-management}

<table>
   <tr>
     <th><p>Task</p></th>
     <th><p>Zilliz BYOC</p></th>
     <th><p>Customer</p></th>
   </tr>
   <tr>
     <td><p>Set up VPC</p></td>
     <td></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Manage EC2 instances</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Manage Kubernetes cluster</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Manage S3 bucket</p></td>
     <td></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Provision Milvus instance</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
</table>

## Upgrade and security{#upgrade-and-security}

<table>
   <tr>
     <th><p>Task</p></th>
     <th><p>Zilliz BYOC</p></th>
     <th><p>Customer</p></th>
   </tr>
   <tr>
     <td><p>Upgrade Milvus instance</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Patch software vulnerabilities</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Patch infrastructure vulnerabilities</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Scale resoures</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

## Access control{#access-control}

<table>
   <tr>
     <th><p>Task</p></th>
     <th><p>Zilliz BYOC</p></th>
     <th><p>Customer</p></th>
   </tr>
   <tr>
     <td><p>Manage IAM roles and service accounts</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Implement access control &amp; auditing</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

## Service availability{#service-availability}

<table>
   <tr>
     <th><p>Task</p></th>
     <th><p>Zilliz BYOC</p></th>
     <th><p>Customer</p></th>
   </tr>
   <tr>
     <td><p>Disaster recovery (DR)</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Service level agreement (SLA)</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

## Technical support{#technical-support}

<table>
   <tr>
     <th><p>Task</p></th>
     <th><p>Zilliz BYOC</p></th>
     <th><p>Customer</p></th>
   </tr>
   <tr>
     <td><p>Logging</p></td>
     <td></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Audit logging</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Monitoring</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Break-glass access</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

