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
import $ from 'jquery';
import RowMerge from './RowMerge';

// define the plugin function on the jQuery extension point.
($.fn as any).rowMerge = function (this: JQuery, args: Args): any {
    
    const MATCH_TEXT_ONLY = function(this: void, value: HTMLTableCellElement, other: HTMLTableCellElement): boolean {
            return value.textContent == other.textContent;
    }
    
    let target = this;
    // merge the global options with the per-call options.
    args = $.extend({}, ($.fn as any).rowMerge.args, args);

    // factory defaults
    if (typeof args.matcher === 'undefined') args.matcher = MATCH_TEXT_ONLY;
    if (typeof args.excludedColumns === 'undefined') args.excludedColumns = new Array();
    if (typeof args.zeroIndexed === 'undefined') args.zeroIndexed = false;

    let rowMerge = new RowMerge(target, args);
    
    var methods = {
        merge: function(): void {
            update(rowMerge.getMerged());
        },
        unmerge: function(): void {
            update(rowMerge.getOriginal());
        }
    };
    methods.merge();
    return methods;

    function update(table: HTMLTableElement): void {
        const t = $(table);
        target.replaceWith(t);
        target = t;
    }
};

// activate plugin by targeting selector
$(function () {
    // factory defaults
    let selector: string = typeof ($.fn as any).rowMerge.selector === 'undefined' ? 'table.row-merge' : ($.fn as any).rowMerge.selector;
    // target
    let s: JQuery<HTMLElement> = $(selector);
    s.each((i,e) => {
        ($(e) as any).rowMerge();
    });
});

// define the plugin's global default selector.
($.fn as any).rowMerge.selector = undefined;

// define the plugin's global default options.
($.fn as any).rowMerge.args = {};