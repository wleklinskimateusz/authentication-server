import z from "zod";
import { ShouldNotHappenError } from "../../domain/errors/should-not-happen-error";

export abstract class BasePostgres<TRow, TInstance> {
    protected abstract rowSchema: z.ZodType<TRow>;

    protected parseUniqueResponse(
        sqlResponse: unknown,
    ): Promise<TInstance> | TInstance | null {
        const schema = z.union([
            z.tuple([
                this.rowSchema,
            ]),
            z.tuple([]),
        ]);
        const parsed = schema.safeParse(sqlResponse);

        if (!parsed.success) {
            throw new ShouldNotHappenError(
                "Invalid SQL response: " + JSON.stringify(parsed.error),
            );
        }

        if (parsed.data.length === 0) {
            return null;
        }

        return this.toInstance(parsed.data[0]);
    }

    protected parseMultipleResponse(
        sqlResponse: unknown,
    ): Promise<TInstance[]> {
        const schema = z.array(this.rowSchema);
        const parsed = schema.safeParse(sqlResponse);

        if (!parsed.success) {
            throw new ShouldNotHappenError(
                "Invalid SQL response: " + JSON.stringify(parsed.error),
            );
        }

        return Promise.all(
            parsed.data.map(async (row) => await this.toInstance(row)),
        );
    }

    abstract toInstance(row: TRow): TInstance | Promise<TInstance>;
}
