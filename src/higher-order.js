/**
 * Baobab-React Higher Order Component
 * ====================================
 *
 * ES6 higher order component to enchance one's component.
 */
import React from 'react';
import abstract from './utils/abstract.js';
import type from './utils/type.js';
import PropTypes from './utils/prop-types.js';

/**
 * Root component
 */
export function root(Component, tree) {
  if (!type.Baobab(tree))
    throw Error('baobab-react:higher-order.root: given tree is not a Baobab.');

  var ComposedComponent = class extends React.Component {

    // Handling child context
    getChildContext() {
      return {
        tree: tree
      };
    }

    // Render shim
    render() {
      return <Component {...this.props} />;
    }
  };

  // Child context types
  ComposedComponent.childContextTypes = {
    tree: PropTypes.baobab
  };

  return ComposedComponent;
}

/**
 * Branch component
 */
export function branch(Component, specs = {}) {
  if (!type.Object(specs))
    throw Error('baobab-react.higher-order: invalid specifications ' +
                '(should be an object with cursors and/or facets key).');

  var ComposedComponent = class extends React.Component {

    // Child context
    getChildContext() {
      return {
        cursors: this.cursors
      };
    }

    // Building initial state
    constructor(props, context) {
      super(props, context);

      var {facet, cursors} = abstract.init.call(
        this,
        context.tree,
        specs.cursors
      );

      if (facet)
        this.state = facet.get();

      this.facet = facet;
      this.cursors = cursors;
    }

    // On component mount
    componentDidMount() {
      if (!this.facet)
        return;

      var handler = (function() {
        this.setState(this.facet.get());
      }).bind(this);

      this.facet.on('update', handler);
    }

    // Render shim
    render() {
      return <Component {...this.props} {...this.state} />;
    }

    // On component unmount
    componentWillUnmount() {
      if (!this.facet)
        return;

      // Releasing facet
      this.facet.release();
      this.facet = null;

      // Releasing cursors
      this.cursors = null;
    }
  };

  ComposedComponent.contextTypes = {
    tree: PropTypes.baobab
  };

  ComposedComponent.childContextTypes = {
    cursors: PropTypes.cursors
  };

  return ComposedComponent;
}