export type Range = [number, number];

export interface FilterValues {
    robot_gen: string,
    robot_name: string,
    start_date: string,
    end_date: string,
    start_time: string,
    end_time: string,
    elapsed_minutes_range: Range
}