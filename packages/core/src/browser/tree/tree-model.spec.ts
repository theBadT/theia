/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { expect } from 'chai';
import { MockTreeModel } from './test/mock-tree-model';
import { TreeModelImpl, TreeModel } from './tree-model';
import { TreeImpl, Tree, TreeNode } from './tree';
import { Container } from 'inversify';
import { TreeSelectionServiceImpl } from './tree-selection-impl';
import { TreeSelectionService, SelectableTreeNode } from './tree-selection';
import { TreeExpansionServiceImpl, TreeExpansionService, ExpandableTreeNode } from './tree-expansion';
import { TreeNavigationService } from './tree-navigation';
import { TreeSearch } from './tree-search';
import { FuzzySearch } from './fuzzy-search';
import { MockLogger } from '../../common/test/mock-logger';
import { ILogger } from '../../common';

// tslint:disable:no-unused-expression
describe('tree-model', () => {
  const model = createTreeModel();
  beforeEach(() => model.root = MockTreeModel.HIERARCHICAL_MOCK_ROOT());

  it('won\'t expand an expanded node', done => {
    const node: ExpandableTreeNode = retrieveNode<ExpandableTreeNode>('1');
    model.expandNode(node).then(result => {
      expect(result).to.be.false;
      expect(ExpandableTreeNode.isExpanded(node)).to.be.true;
      expect(ExpandableTreeNode.isCollapsed(node)).to.be.false;
      done();
    });
  });

  it('will expand a collapsed node', done => {
    const node: ExpandableTreeNode = retrieveNode<ExpandableTreeNode>('1');
    model.collapseNode(node).then(() => {
      model.expandNode(node).then(result => {
        expect(result).to.be.true;
        expect(ExpandableTreeNode.isExpanded(node)).to.be.true;
        expect(ExpandableTreeNode.isCollapsed(node)).to.be.false;
        done();
      });
    });
  });

  it('won\'t expand an undefined node while nothing is selected', done => {
    model.expandNode(undefined).then(result => {
      expect(result).to.be.false;
      done();
    });
  });

  it('will expand a recently selected node when undefined is passed', done => {
    const node: ExpandableTreeNode = retrieveNode<ExpandableTreeNode>('1');
    model.collapseNode(node);
    model.selectNode(retrieveNode<SelectableTreeNode>('1'));
    model.expandNode(undefined).then(result => {
      expect(result).to.be.true;
      expect(ExpandableTreeNode.isExpanded(node)).to.be.true;
      expect(ExpandableTreeNode.isCollapsed(node)).to.be.false;
      done();
    });
  });

  it('will expand the most recently selected node when undefined is passed', done => {
    const first: ExpandableTreeNode = retrieveNode<ExpandableTreeNode>('1.1');
    const second: ExpandableTreeNode = retrieveNode<ExpandableTreeNode>('1.2');
    model.collapseNode(first);
    model.collapseNode(second);
    model.selectNode(retrieveNode<SelectableTreeNode>('1.1'));
    model.selectNode(retrieveNode<SelectableTreeNode>('1.2'));
    model.expandNode(undefined).then(result => {
      expect(result).to.be.true;
      expect(ExpandableTreeNode.isCollapsed(first)).to.be.true;
      expect(ExpandableTreeNode.isExpanded(first)).to.be.false;
      expect(ExpandableTreeNode.isCollapsed(second)).to.be.false;
      expect(ExpandableTreeNode.isExpanded(second)).to.be.true;
      done();
    });
  });

  function retrieveNode<T extends TreeNode>(id: string): Readonly<T> {
    const readonlyNode: Readonly<T> = model.getNode(id) as T;
    return readonlyNode;
  }

  function createTreeModel(): TreeModel {
    const container = new Container({ defaultScope: 'Singleton' });
    container.bind(TreeImpl).toSelf();
    container.bind(Tree).toService(TreeImpl);
    container.bind(TreeSelectionServiceImpl).toSelf();
    container.bind(TreeSelectionService).toService(TreeSelectionServiceImpl);
    container.bind(TreeExpansionServiceImpl).toSelf();
    container.bind(TreeExpansionService).toService(TreeExpansionServiceImpl);
    container.bind(TreeNavigationService).toSelf();
    container.bind(TreeModelImpl).toSelf();
    container.bind(TreeModel).toService(TreeModelImpl);
    container.bind(TreeSearch).toSelf();
    container.bind(FuzzySearch).toSelf();
    container.bind(MockLogger).toSelf();
    container.bind(ILogger).to(MockLogger).inSingletonScope();
    return container.get(TreeModel);
}
});
