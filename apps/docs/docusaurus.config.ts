import {resolveSiteProfile} from '@zilliz/site-config';
import {createDocusaurusConfig} from './src/config/createDocusaurusConfig';

export default createDocusaurusConfig(resolveSiteProfile(process.env.ZDOC_SITE));
