import { default as React } from 'react';
import { ConfidenceLevel } from '../types';
export interface ConfidenceDotProps {
    level?: ConfidenceLevel;
    labels?: Partial<Record<ConfidenceLevel, string>>;
}
export declare function ConfidenceDot({ level, labels }: ConfidenceDotProps): React.ReactElement | null;
//# sourceMappingURL=ConfidenceDot.d.ts.map