import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsCommon } from '../common/common';

export const clearSheetAction = createAction({
    name: 'clear_sheet',
    description: 'Clears all rows on an existing sheet',
    displayName: 'Clear Sheet',
    props: {
        authentication: googleSheetsCommon.authentication,
        spreadsheet_id: googleSheetsCommon.spreadsheet_id,
        include_team_drives: googleSheetsCommon.include_team_drives,
        sheet_id: googleSheetsCommon.sheet_id,
        ignore_first_row: Property.Checkbox({
            displayName: 'Is First row Headers?',
            description: 'If the first row is headers',
            required: false,
            defaultValue: false,
        }),
    },
    async run(context) {
        const sheetName = await googleSheetsCommon.findSheetName(context.propsValue['authentication']['access_token'],
            context.propsValue['spreadsheet_id'],
            context.propsValue['sheet_id']);
        if (!sheetName) {
            throw Error("Sheet not found in spreadsheet");
        }
     
        const RowsToDelete: number[] = [];
        const values = await googleSheetsCommon.getValues(context.propsValue.spreadsheet_id, context.propsValue['authentication']['access_token'], context.propsValue.sheet_id);
        for (const key in values) {
            if (key === '0' && context.propsValue.ignore_first_row) {
                continue;
            }
            RowsToDelete.push(parseInt(key) + 1);
        }

        for (let i = 0; i < RowsToDelete.length; i++) {
            await googleSheetsCommon.deleteRow(context.propsValue.spreadsheet_id, context.propsValue.sheet_id, context.propsValue.ignore_first_row ? 1 : 0, context.propsValue['authentication']['access_token'])
        }

        return {
            deletedRow: RowsToDelete,
        }
    },
});
