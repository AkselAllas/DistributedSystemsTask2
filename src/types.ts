export interface ProcessNode {
    id: number;
    name: string;
    electionCount: number;
    time: string;
    allNodeIds: number[];
    isCoordinator: boolean;
    isElecting: boolean;
    originalTime: string;
}
