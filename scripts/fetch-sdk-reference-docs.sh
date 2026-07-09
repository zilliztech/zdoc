#!/usr/bin/env bash
set -euo pipefail

npx docusaurus fetch-lark-docs -man python -src-only
npx docusaurus fetch-lark-docs -man pymilvus25 -src-only
npx docusaurus fetch-lark-docs -man pymilvus26 -src-only
npx docusaurus fetch-lark-docs -man pymilvus30 -tar zilliz -s3 --incremental --buildEnv uat
npx docusaurus fetch-lark-docs -man pymilvus30 -tar zilliz -post

npx docusaurus fetch-lark-docs -man javaV2 -src-only
npx docusaurus fetch-lark-docs -man javaV225 -src-only
npx docusaurus fetch-lark-docs -man javaV226 -src-only
npx docusaurus fetch-lark-docs -man javaV230 -tar zilliz -s3 --incremental --buildEnv uat
npx docusaurus fetch-lark-docs -man javaV230 -tar zilliz -post

npx docusaurus fetch-lark-docs -man node -src-only
npx docusaurus fetch-lark-docs -man nodejs25 -src-only
npx docusaurus fetch-lark-docs -man nodejs26 -src-only
npx docusaurus fetch-lark-docs -man nodejs30 -tar zilliz -s3 --incremental --buildEnv uat
npx docusaurus fetch-lark-docs -man nodejs30 -tar zilliz -post

npx docusaurus fetch-lark-docs -man gov226 -src-only
npx docusaurus fetch-lark-docs -man gov230 -tar zilliz -s3 --incremental --buildEnv uat
npx docusaurus fetch-lark-docs -man gov230 -tar zilliz -post

npx docusaurus fetch-lark-docs -man cliv13 -src-only
npx docusaurus fetch-lark-docs -man cliv14 -tar zilliz -s3 --incremental --buildEnv uat

npx docusaurus fetch-apifox-docs -s plugins/apifox-docs/meta/openapi/
npx docusaurus report-to-lark --card-advance
