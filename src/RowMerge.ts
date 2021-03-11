/*! 
 *  Merge identical table rows jQuery plugin.
 *  Copyright (C) 2021  Andrew Wagner  github.com/andreww1011
 *
 *  This library is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Lesser General Public
 *  License as published by the Free Software Foundation; either
 *  version 2.1 of the License, or (at your option) any later version.
 * 
 *  This library is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  Lesser General Public License for more details.
 * 
 *  You should have received a copy of the GNU Lesser General Public
 *  License along with this library; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301
 *  USA
 */

const NULL_CELL = new class implements Cell {
    columnAddress(): number {return 0;}
    width(): number {return 0;}
    getCell(): HTMLTableCellElement {return null;}
    matches(other: Cell) {return false;}
}

interface Cell {
    columnAddress(): number;
    width(): number;
    getCell(): HTMLTableCellElement;
    matches(other: Cell): boolean;
}

export default class RowMerge {

    private static SingleCell = class implements Cell {
        
        private col: number;
        private w: number;
        private cell: HTMLTableCellElement;
        private matcher: (this:void, value: HTMLTableCellElement, other:HTMLTableCellElement) => boolean;

        constructor(column: number, width: number, cell:HTMLTableCellElement, matcher: (this:void, value: HTMLTableCellElement, other:HTMLTableCellElement) => boolean) {
            this.col = column;
            this.w = width;
            this.cell = cell;
            this.matcher = matcher;
        }
        columnAddress(): number {return this.col;}
        width(): number {return this.w;}
        getCell(): HTMLTableCellElement {return this.cell;}
        matches(other: Cell): boolean {return this.matcher(this.getCell(),other.getCell());}
    }

    private origTable: HTMLTableElement;
    private mergeTable: HTMLTableElement;

    constructor (tableTarget: JQuery<HTMLElement>, args: Args) {
        let t = tableTarget.get(0);
        if (!(t instanceof HTMLTableElement)) {
            throw new Error("JQuery target must be a table element.");
        }
        this.origTable = t;
        let exc: Array<number> = args.zeroIndexed ? args.excludedColumns : args.excludedColumns.map((n) => n - 1);
        this.mergeTable = RowMerge.merge(t, args.matcher, exc);
    }

    private static merge(table: HTMLTableElement, matcher: (this:void, value: HTMLTableCellElement, other:HTMLTableCellElement) => boolean, excludedColumns: Array<number>): HTMLTableElement {
        let t:HTMLTableElement = <HTMLTableElement>table.cloneNode(true);
        let s:HTMLCollectionOf<HTMLTableSectionElement> = t.tBodies;
        for (let i = 0; i < s.length; i++) {
            let section:HTMLTableSectionElement = s.item(i);
            RowMerge.mergeSection(section, matcher, excludedColumns);
        }
        return t;
    }

    private static mergeSection(section: HTMLTableSectionElement, matcher: (this:void, value: HTMLTableCellElement, other:HTMLTableCellElement) => boolean, excludedColumns: Array<number>): void {
        let rows: HTMLCollectionOf<HTMLTableRowElement> = section.rows;
        if (rows.length == 0) {
            return;
        }
        let arr:Array<Cell> = new Array();
        arr.push(NULL_CELL);
        for (let r = 0; r < rows.length; r++) {
            let row = rows.item(r);
            let cells: Array<Cell> = RowMerge.createCells(row.cells, matcher);
            if (cells.length == 0) {
                continue;
            }
            let ia: number = 0;
            let ib: number = 0;
            let arrNew: Array<Cell> = new Array();
            while (ia < arr.length && ib < cells.length) {
                let cellA: Cell = arr[ia];
                let cellB: Cell = cells[ib];
                let ca: number = cellA.columnAddress();
                let cb: number = cellB.columnAddress();
                if (ca > cb) {
                    ib++;
                    arrNew.push(cellB);
                } else if (ca < cb) {
                    ia++;
                } else { 
                    //ca == cb
                    if (excludedColumns.some((n) => ca === n)) {
                        ia++;
                        ib++;
                        arrNew.push(cellB);
                    } else {
                        let wa: number = cellA.width();
                        let wb: number = cellB.width();
                        if (wa != wb) {
                            ia++;
                            ib++;
                            arrNew.push(cellB);
                        } else {
                            //wa == wb
                            if (cellA.matches(cellB)) {
                                arrNew.push(cellA);
                                cellA.getCell().rowSpan++;
                                row.removeChild(cellB.getCell());
                                ia++;
                                ib++;
                            } else {
                                ia++;
                                ib++;
                                arrNew.push(cellB);
                            }
                        }
                    }
                }
            }
            for (; ib < cells.length; ib++) {
                let cellB: Cell = cells[ib];
                arrNew.push(cellB);
            }
            arr = arrNew;
        }
    }

    private static createCells(cells: HTMLCollectionOf<HTMLTableCellElement>, matcher: (this:void, value: HTMLTableCellElement, other:HTMLTableCellElement) => boolean): Array<Cell> {
        let a: Array<Cell> = new Array(cells.length);
        for (let i = 0, col = 0; i < cells.length; i++) {
            let c:HTMLTableCellElement = cells.item(i);
            let width: number = c.colSpan;
            a[i] = new RowMerge.SingleCell(col, width, c, matcher);
            col += width;
        }
        return a;
    }

    public getMerged(): HTMLTableElement {
        return this.mergeTable;
    }

    public getOriginal(): HTMLTableElement {
        return this.origTable;
    }
}