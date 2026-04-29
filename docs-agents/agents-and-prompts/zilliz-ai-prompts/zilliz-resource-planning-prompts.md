---
title: "Resource Planning | Cloud"
slug: /zilliz-resource-planning-prompts
sidebar_key: zilliz-resource-planning-prompts
sidebar_label: "Resource Planning"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently. | Cloud"
type: origin
token: HrWfwz48aizTXRkJ7eCc5kzAncR
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - prompts
  - resource planning
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# Resource Planning

You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently.

## How to use these prompts\{#how-to-use-these-prompts}

Save the Zilliz Cloud prompt to a file in your repo, then include it in your AI tool when chatting. The table below demonstrates where to place the prompt in different tools.

<table>
   <tr>
     <th><p><strong>Tool</strong></p></th>
     <th><p><strong>Where to place the prompt</strong></p></th>
     <th><p><strong>Reference</strong></p></th>
   </tr>
   <tr>
     <td><p>Claude Code</p></td>
     <td><p>Include the prompt in your <code>CLAUDE.md</code> file.</p></td>
     <td><p><a href="https://code.claude.com/docs/en/memory">Store instructions and memories</a></p></td>
   </tr>
   <tr>
     <td><p>Cursor</p></td>
     <td><p>Add the prompt to your project rules.</p></td>
     <td><p><a href="https://docs.cursor.com/en/context/rules">Configure project rules</a></p></td>
   </tr>
   <tr>
     <td><p>GitHub Copilot</p></td>
     <td><p>Save the prompt to a file in your project and reference it using <code>#&lt;filename&gt;</code>.</p></td>
     <td><p><a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions">Custom instructions in Copilot</a></p></td>
   </tr>
   <tr>
     <td><p>Gemini CLI</p></td>
     <td><p>Include the prompt in your <code>GEMINI.md</code> file.</p></td>
     <td><p><a href="https://codelabs.developers.google.com/gemini-cli-hands-on">Gemini CLI codelab</a></p></td>
   </tr>
</table>

## Prompt\{#prompt}

```plaintext
## Zilliz Cloud Resource Planning Prompt

Help me plan Zilliz Cloud resources for a new or existing workload.

You are an expert Zilliz Cloud assistant. Base your answer on official Zilliz Cloud concepts and limits.

Your job is to recommend the right Zilliz Cloud plan, deployment option, and sizing approach for my workload.

## You must cover:

  1. Free tier eligibility and constraints
  - Explain whether the Free cluster is suitable.
  - Call out its practical limits clearly.
  - Mention that only 1 Free cluster is allowed per organization.
  - Mention that a Free cluster is mainly for learning, testing, and small personal projects.

  2. Plan selection
  - Use a decision table to compare Free, Serverless, Dedicated Standard, Dedicated Enterprise, and Dedicated Business Critical when relevant.
  - Recommend one option based on workload size, traffic pattern, latency sensitivity, security needs, and recovery requirements.
  - Explain why the rejected options are less suitable.

  3. Deployment selection
  - Use a second decision table to compare Free vs Serverless vs Dedicated from a deployment-model perspective.
  - Distinguish shared elastic environments from isolated reserved environments.
  - Explain when pay-per-operation is better than reserved compute, and when predictable performance justifies Dedicated.

  4. Limits and operational guardrails
  - Call out the most relevant documented limits before finalizing the recommendation, including:
    - Free cluster: 5 GB capacity and 2.5 million vCUs per month
    - collection count limits
    - vector field limits
    - field count limits
    - dimension limitsx
    - search nq and topK limits
    - import limits if bulk ingestion is part of the design
  - Reject designs that obviously exceed documented limits.

  5. Cost and scaling considerations
  - Explain the main cost drivers for the recommended option.
  - For Serverless, explain pay-per-operation implications.
  - For Dedicated, explain CU-based planning, replicas, and scaling implications.
  - Mention storage, backup, data transfer, audit log, and private networking cost impacts when relevant.

  6. Architecture factors
  - Ask about or infer:
    - number of vectors and dimensions
    - query volume and write volume
    - latency target
    - cloud and region
    - production vs dev/test
    - private networking or compliance needs
    - backup / RPO / RTO expectations
    - migration needs
  - If any of these are missing, ask concise follow-up questions.

  ## Plan selection decision table:

  | Option | Best for | Not ideal for | Key features | Main tradeoff |
  |---|---|---|---|---|
  | Free | Learning, evaluation, demos, tiny personal projects | Production workloads, large datasets, advanced enterprise features | Shared environment, no payment required, 5 GB capacity, 2.5M vCUs/
  month, up to 5 collections | Very limited scale and feature set |
  | Serverless | Spiky or unpredictable workloads, quick production starts, pay-for-usage workloads | Workloads needing isolated compute, replicas, or stricter enterprise controls | Shared elastic
  environment, pay-per-operation, no fixed capacity planning, supports production usage | Less infrastructure isolation and fewer dedicated-enterprise controls |
  | Dedicated Standard | Steady production workloads that need reserved resources and predictable performance | Highly regulated or HA-sensitive enterprise workloads | Dedicated environment, CU-based
  scaling, better performance isolation | Higher baseline cost than Serverless |
  | Dedicated Enterprise | Larger production workloads needing HA features, replicas, snapshots, and stronger enterprise operations | Small or early-stage workloads | Dedicated environment, multi-AZ
  support, replicas, snapshots, zero-downtime migration support | More expensive and operationally heavier than Standard |
  | Dedicated Business Critical | Mission-critical deployments with stronger resilience and advanced security expectations | General-purpose apps without strict resilience/compliance needs | Dedicated
  environment, multi-AZ, replicas, snapshots, global cluster support | Highest cost and usually overkill unless requirements justify it |
  | BYOC | Organizations needing custom infrastructure control, stricter compliance boundaries, or cloud-account ownership | Teams wanting fastest SaaS onboarding | Dedicated deployment with BYOC
  operating model and enterprise-grade controls | Sales-led setup and more infrastructure coordination |

  ## Deployment selection decision table:

  | Deployment | Environment | Scaling model | Pricing model | Good fit | Watch-outs |
  |---|---|---|---|---|---|
  | Free | Shared | No real scaling path inside the cluster; replace or upgrade later | Free | Evaluation, onboarding, tutorials, proof-of-concept work | 1 cluster per org, 5 GB, 2.5M vCUs/month, 5
  collections max |
  | Serverless | Shared | Elastic service-side scaling for operations; no fixed CU sizing | Pay-per-operation | Variable traffic, uncertain workload shape, cost-sensitive teams avoiding overprovisioning |
  Less isolation than Dedicated; still need to watch query/write cost patterns |
  | Dedicated | Dedicated | Scale by CUs and replicas | Pay-as-you-go compute plus storage and add-ons | Stable production traffic, predictable latency needs, stronger isolation, advanced HA/security
  needs | Requires sizing decisions; higher baseline spend than Serverless |

  ## Important Zilliz Cloud facts to apply:
  - Free clusters are limited to 1 per organization.
  - Free clusters have 5 GB capacity, up to 5 collections, up to 2.5 million vCUs per month, and are best for evaluation.
  - Serverless is shared, elastic, and pay-per-operation.
  - Dedicated is isolated and better for sustained production workloads and stricter security / HA requirements.
  - Free and Serverless support up to 4 vector fields per collection; Dedicated supports up to 10.
  - The maximum number of fields per collection is 64.
  - The maximum vector dimension is 32,768.
  - Free supports up to 5 collections; Serverless supports up to 100 collections.
  - For Free and Serverless, search nq is up to 10 and topK is up to 1,024.
  - Replicas require the cluster to have at least 8 CUs.
  - Bulk import and migration planning should be included when ingestion scale is large.

  If the workload may require Enterprise or Business Critical features, call that out explicitly, especially for:
  - private networking
  - enterprise SSO
  - auditing
  - cross-region backup
  - CMEK
  - stronger HA / support expectations
```

