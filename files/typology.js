var _SIZE_HEIGHT = 600;
var _SIZE_WIDTH = 750;
var _NODE_SIZE = 13;

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function ensureX(x) {
    if (x < _NODE_SIZE + 5) {
        x = _NODE_SIZE + 5;
    }

    if (x > _SIZE_WIDTH - _NODE_SIZE - 5) {
        x = _SIZE_WIDTH - _NODE_SIZE - 5;
    }

    return x;
}

function ensureY(y) {
    if (y < _NODE_SIZE + 5) {
        y = _NODE_SIZE + 5
    }

    if (y > _SIZE_HEIGHT - _NODE_SIZE - 5) {
        y = _SIZE_HEIGHT - _NODE_SIZE - 5;
    }

    return y;
}

var previousSelectedNodeIndex = null;
var selectedNodeIndex = null;

var activateNode = null;

function sendActiveStatus(node) {
    $.ajax({
        type: "POST",
        url: '/Node/Activate',
        data: {id: node},
        success: function () {
            d3.selectAll("g").select("circle").style("stroke", function (node) {
                if (node.active === false) {
                    return "red";
                } else {
                    return "black";
                }
            })
        }
    });
}

function sendInactiveStatus(node) {
    $.ajax({
        type: "POST",
        url: '/Node/Inactivate',
        data: {id: node},
        success: function () {
            d3.selectAll("g").select("circle").style("stroke", function (node) {
                if (node.active === false) {
                    return "red";
                } else {
                    return "black";
                }
            })
        }
    });
}

function selectNodeIndex(index, id) {
    previousSelectedNodeIndex = selectedNodeIndex;
    selectedNodeIndex = index;

    if (previousSelectedNodeIndex != null) {
        $('#btn_link').show();
    }

    if (id != null) {
        d3.select('#canvas').selectAll('.node').attr('active', function (node) {
            if (id === node.id && node.active === false) {
                node.active = true;

                sendActiveStatus(id);
            }
        });
        $('#btn_a_node').show();
    }
}

var TopologyEditor = function () {
    function TopologyEditor() {
        var _this = this;
        _classCallCheck(this, TopologyEditor);
        this.canvas = d3.select('#canvas').append('svg:svg').attr('width', _SIZE_WIDTH).attr('height', _SIZE_HEIGHT);

        this.vis = this.canvas.append('svg:g');

        this.vis.append('svg:g').attr('class', 'linkContainer');
        this.vis.append('svg:g').attr('class', 'nodeContainer');

        this.forceLayout = d3.layout.force()
            .size([_SIZE_WIDTH, _SIZE_HEIGHT]).nodes([])
            .links([])
            .charge(function (d) {
                return -10;
            })
            .gravity(0)
            .on("tick", this._tick.bind(this));

        this.forceLayout.linkDistance(function (link) {
            if (link.source.connector === true && link.target.connector === true) {
                return 250;
                // } else if (((link.source.connector === true && link.target.connector === false) || (link.source.connector === false && link.target.connector === true)) && link.invisible) {
                //     return 75;
            } else if ((link.source.connector === true && link.target.connector === false) || (link.source.connector === false && link.target.connector === true)) {
                return 75;
            } else {
                return 100;
            }
        });

        if (document.querySelector('#btn_node') !== null) {
            document.querySelector('#btn_node').addEventListener('click', function (e) {
                $.ajax({
                    url: '/node/add',
                    type: 'POST',
                    data: {
                        selectedPattern: selectedNodeIndex !== null ? _this.forceLayout.nodes()[selectedNodeIndex].pattern : -1
                    },
                    success: function (data) {
                        var node = {
                            type: 'node',
                            id: data.node.nodeId,
                            x: ensureX(Math.random() * _SIZE_WIDTH),
                            y: ensureY(Math.random() * _SIZE_HEIGHT),
                            pattern: data.node.patternId,
                            connector: data.node.isConnector,
                            active: data.node.isActivate
                        };

                        _this.forceLayout.nodes().push(node);

                        data.addLinks.forEach(function (link) {
                            _this.forceLayout.links().push({
                                source: findNodeIndex(link.source.nodeId),
                                target: findNodeIndex(link.target.nodeId),
                                invisible: link.invisible,
                                id: link.linkId
                            });
                        });

                        data.removeLinks.forEach(function (rLink) {
                            index = 0;

                            _this.forceLayout.links().forEach(function(link){
                                if (rLink.linkId === link.id){
                                    console.log('asd');
                                }
                            });
                        });

                        _this._redraw();
                    }
                });
            });

            document.querySelector('#btn_c_node').addEventListener('click', function (e) {
                if (selectedNodeIndex === null) {
                    alert('Please select a pattern to link the new pattern to');
                } else {
                    $.ajax({
                        url: '/node/add',
                        type: 'POST',
                        data: {
                            connector: true,
                            selectedPattern: _this.forceLayout.nodes()[selectedNodeIndex].pattern
                        },
                        success: function (data) {
                            var node = {
                                type: 'node',
                                id: data.node.nodeId,
                                x: ensureX(Math.random() * _SIZE_WIDTH),
                                y: ensureY(Math.random() * _SIZE_HEIGHT),
                                pattern: data.node.patternId,
                                connector: data.node.isConnector,
                                active: data.node.isActivate
                            };

                            _this.forceLayout.nodes().push(node);

                            data.addLinks.forEach(function (link) {
                                _this.forceLayout.links().push({
                                    source: findNodeIndex(link.source.nodeId),
                                    target: findNodeIndex(link.target.nodeId),
                                    invisible: link.invisible,
                                    id: link.linkId
                                });
                            });

                            data.removeLinks.forEach(function (rLink) {
                                index = 0;
                                
                                _this.forceLayout.links().forEach(function(link){
                                    if (rLink.linkId === link.id){
                                        console.log('asd');
                                    } 
                                });
                            });
                            
                            _this._redraw();
                        }
                    });
                }
            });
            
            document.querySelector('#btn_link').addEventListener('click', function (e) {

                if (previousSelectedNodeIndex === selectedNodeIndex) {
                    alert('Source node is the same as target node');
                } else {

                    var sourceNode = _this.forceLayout.nodes()[previousSelectedNodeIndex];
                    var targetNode = _this.forceLayout.nodes()[selectedNodeIndex];

                    if (!sourceNode.connector) {
                        alert("Source is not a connector node");
                    } else if (!targetNode.connector) {
                        alert("Target is not a connector node");
                    } else {
                        $.ajax({
                            url: '/node/link',
                            type: 'POST',
                            data: {
                                source: sourceNode.id,
                                target: targetNode.id
                            },
                            success: function (data) {
                                _this.forceLayout.links().push({
                                    source: findNodeIndex(data.source.nodeId),
                                    target: findNodeIndex(data.target.nodeId),
                                    invisible: false
                                });

                                $('#btn_link').hide();

                                _this._redraw();
                            }
                        });
                    }
                }
            });
        }

        nodes.forEach(function (node) {
            _this.addNode(node);
        });

        links.forEach(function (link) {
            _this.forceLayout.links().push({
                source: findNodeIndex(link.source),
                target: findNodeIndex(link.target),
                invisible: link.invisible,
                id: link.id
            });
        });
        _this._redraw();

        function findNodeIndex(nodeId) {
            var nodes = _this.forceLayout.nodes();

            var index = 0;
            var found = false;
            nodes.forEach(function (node) {
                if (!found) {
                    if (node.id === nodeId) {
                        found = true;
                    } else {
                        index++;
                    }
                }
            });

            return index;
        }
    }

    _createClass(TopologyEditor, [{
        key: 'addNode', value: function addNode(nodeInstance, connector) {
            var _this = this;
            if (nodeInstance === undefined || nodeInstance === false) {
                $.ajax({
                    url: '/node/add',
                    type: 'POST',
                    data: {
                        connector: connector !== undefined && connector === true,
                        selectedPattern: selectedNodeIndex !== undefined && selectedNodeIndex !== null ? this.forceLayout.nodes()[selectedNodeIndex].pattern : -1
                    },
                    success: function (data) {
                        var node = {
                            type: 'node',
                            id: data.nodeId,
                            x: ensureX(Math.random() * _SIZE_WIDTH),
                            y: ensureY(Math.random() * _SIZE_HEIGHT),
                            pattern: data.patternId,
                            connector: data.connector,
                            active: data.active
                        };

                        _this.forceLayout.nodes().push(node);
                        _this._redraw();
                    }
                });
            } else {
                var node = {
                    type: 'node',
                    id: nodeInstance.id,
                    x: ensureX(Math.random() * _SIZE_WIDTH),
                    y: ensureY(Math.random() * _SIZE_HEIGHT),
                    pattern: nodeInstance.pattern,
                    connector: nodeInstance.connector,
                    active: nodeInstance.active
                };

                _this.forceLayout.nodes().push(node);
                _this._redraw();
            }
        }
    }, {
        key: 'addLink', value: function addLink() {
            var _this = this;
            var source = -1, target = -1, count = 0;
            var nodes = this.forceLayout.nodes();

            while (count < 1500) {
                var a = Math.floor(Math.random() * nodes.length);
                var b = Math.floor(Math.random() * nodes.length);
                var s = Math.min(a, b);
                var l = Math.max(a, b);
                count += 1;

                if (nodes[s].connector === true && nodes[l].connector === true && this._verifyNewLink(s, l, nodes[s].id, nodes[l].id)) {
                    source = s;
                    target = l;
                    break;
                }
            }

            if (source === -1 && target === -1) {
                console.error('unable to create a random link');
                return;
            }

            if (previousSelectedNodeIndex === selectedNodeIndex) {
                alert('Source node is the same as target node');
            } else {

                var sourceNode = this.forceLayout.nodes()[previousSelectedNodeIndex];
                var targetNode = this.forceLayout.nodes()[selectedNodeIndex];

                if (!sourceNode.connector) {
                    alert("Source is not a connector node");
                } else if (!targetNode.connector) {
                    alert("Target is not a connector node");
                } else {
                    $.ajax({
                        url: '/node/link',
                        type: 'POST',
                        data: {
                            source: sourceNode.id,
                            target: targetNode.id
                        },
                        success: function (data) {
                            _this.forceLayout.links().push({
                                source: findNodeIndex(data.source.nodeId),
                                target: findNodeIndex(data.target.nodeId),
                                invisible: data.invisible
                            });
                        }
                    });
                }
            }

            $('#btn_link').hide();

            this._redraw();
        }
    }, {
        key: '_tick', value: function _tick() {
            this.vis.selectAll('.node').attr('transform', function (d) {
                return 'translate(' + d.x + ', ' + d.y + ')';
            });

            var size = this.forceLayout.nodes().length;
            var randomIndex = Math.floor(Math.random() * size);
            if (this.forceLayout.nodes()[randomIndex].active !== false) {
                var chance = Math.random() * 1000;

                if (chance > 997) {
                    this.forceLayout.nodes()[randomIndex].active = false;

                    sendInactiveStatus(this.forceLayout.nodes()[randomIndex].id);

                    d3.selectAll("g").select("circle").style("stroke", function (node) {
                        if (node.active === false) {
                            return "red";
                        } else {
                            return "black";
                        }
                    });
                }
            }

            this.forceLayout.nodes().forEach(function (d) {
                d.x = Math.max(6, Math.min(_SIZE_WIDTH - _NODE_SIZE, d.x));
                d.y = Math.max(6, Math.min(_SIZE_HEIGHT - _NODE_SIZE, d.y));
            });

            if (selectedNodeIndex !== undefined && selectedNodeIndex !== null) {
                var pattern = 'P' + ('00' + this.forceLayout.nodes()[selectedNodeIndex].pattern).slice(-2);
                $('#selected_pattern').text(pattern);
            }

            this.vis.selectAll(".link").attr("x1", function (d) {
                return d.source.x;
            }).attr("y1", function (d) {
                return d.source.y;
            }).attr("x2", function (d) {
                return d.target.x;
            }).attr("y2", function (d) {
                return d.target.y;
            });
        }
    }, {
        key: '_redraw', value: function _redraw() {
            this._updateNodes();
            this._updateLinks();
            this.forceLayout.start();
        }
    }, {
        key: '_updateNodes', value: function _updateNodes() {
            var nodes = this.forceLayout.nodes();
            var sel = this.vis.select('.nodeContainer').selectAll('.node');
            var binding = sel.data(nodes);
            var colors = d3.scale.category20().domain(
                [
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    11, 12, 13, 14, 15, 16, 17, 18, 19
                ]
            );

            binding.enter().insert('g').attr({
                'class': 'node',
                'id': nodes.length,
                'data-container': 'body',
                'data-toggle': 'popover',
                'data-content': 'Pattern: P' + ('00' + nodes[nodes.length - 1].pattern).slice(-2),
                'title': 'N' + ('00' + nodes[nodes.length - 1].id).slice(-2),
                'onclick': 'selectNodeIndex(' + (nodes.length - 1) + ',' + nodes[nodes.length - 1].id + ')'
            }).style('z-index', 1).call(function (sel) {
                sel.each(function (d) {
                    var node = d3.select(this);
                    node.append('circle').attr('r', 0)
                        .style("stroke", function (node) {
                            if (node.active === false) {
                                return "red";
                            }
                            return "black";
                        })
                        .style("stroke-width", function (node) {
                            return node.connector ? '8px' : '5px';
                        })
                        .style('fill', function (d) {
                            return colors((d.pattern));
                        }).transition().duration(750).ease('elastic').attr('r', _NODE_SIZE);
                });
            }).call(this.forceLayout.drag);
        }
    }, {
        key: '_updateLinks', value: function _updateLinks() {
            var layout_links = this.forceLayout.links();
            var links = this.vis.select('.linkContainer').selectAll(".link").data(layout_links);
            var _this = this;
            var colors = d3.scale.category20().domain(
                [
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    11, 12, 13, 14, 15, 16, 17, 18, 19
                ]
            );

            links.enter().insert('line').attr('class', 'link').style('stroke', function (d) {
                var nodes = _this.forceLayout.nodes();
                var sourceNode = nodes[d.source];
                var targetNode = nodes[d.target];

                if (d.invisible) {
                    return 'transparent';
                }

                return sourceNode.connector === true && targetNode.connector === true ? 'black' : colors((sourceNode.pattern));
            }).style('stroke-width', 5).attr('x1', function (d) {
                return d.source.x;
            }).attr('y1', function (d) {
                return d.source.y;
            }).attr('x2', function (d) {
                return d.target.x;
            }).attr('y2', function (d) {
                return d.target.y;
            });
        }
    }, {
        key: '_findNodeByID', value: function _findNodeByID(
            id) {
            return this.forceLayout.nodes().filter(function (d) {
                return d.id === id;
            })[0];
        }
    }, {
        key: '_findLink', value: function _findLink(
            source, target) {
            return this.forceLayout.links().filter(function (d) {
                return (
                    d.source.id === source && d.target.id === target);
            })[
                0];
        }
    }, {
        key: '_verifyNewLink', value: function _verifyNewLink(
            source, target, sid, tid) {
            return (
                source >= 0 &&
                target >= 0 &&
                source !== target &&
                !this._findLink(sid, tid));

        }
    }]);
    return TopologyEditor;
}();


window.editor = new TopologyEditor();
