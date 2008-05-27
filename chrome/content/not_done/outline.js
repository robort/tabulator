function Outline(doc) {
    var myDocument=doc;
    var HTML_NS = 'http://www.w3.org/1999/xhtml';
    this.document=doc;
    var outline = this; //Kenny: do we need this?
    var thisOutline = this;
    var selection=[]
    this.selection=selection;
    this.ancestor = ancestor // make available as outline.ancestor in callbacks
    this.sparql = sparql;
    this.kb = kb;
    myDocument.outline = this;
    
    //people like shortcuts for sure
    var tabont = tabulator.ns.tabont;
    var foaf = tabulator.ns.foaf;
    var rdf = tabulator.ns.rdf;
    var RDFS = tabulator.ns.rdfs;
    var OWL = tabulator.ns.owl;
    var dc = tabulator.ns.dc;
    var rss = tabulator.ns.rss;
    var xsd = tabulator.ns.xsd;
    var contact = tabulator.ns.contact;
    var mo = tabulator.ns.mo;
    
    //var selection = []  // Array of statements which have been selected
    this.focusTd; //the <td> that is being observed
    this.UserInput=new UserInput(this);
    this.clipboardAddress="tabulator:clipboard";
    this.UserInput.clipboardInit(this.clipboardAddress);
    var outlineElement=this.outlineElement;
     
    this.init = function(){
        var table=myDocument.getElementById('outline');
        table.outline=this;
    }    
    
    this.viewAndSaveQuery = function() {
        tabulator.log.info("outline.doucment is now " + outline.document.location);    
        var q = saveQuery();
        if(isExtension) {
            tabulator.drawInBestView(q);
        } else {
            var i;
            for(i=0; i<qs.listeners.length; i++) {
                qs.listeners[i].getActiveView().view.drawQuery(q);
                qs.listeners[i].updateQueryControls(qs.listeners[i].getActiveView()); 
            }
        }
    }
    
    function saveQuery() {
        var q= new Query()
        var i, n=selection.length, j, m, tr, sel, st;
        for (i=0; i<n; i++) {
            sel = selection[i]
            tr = sel.parentNode
            st = tr.AJAR_statement
            tabulator.log.debug("Statement "+st)
            if (sel.getAttribute('class').indexOf('pred') >= 0) {
            tabulator.log.info("   We have a predicate")
            makeQueryRow(q,tr)
            }
            if (sel.getAttribute('class').indexOf('obj') >=0) {
                    tabulator.log.info("   We have an object")
                    makeQueryRow(q,tr,true)
            }
        }   
        qs.addQuery(q);

        function resetOutliner(pat) {
            optionalSubqueriesIndex=[]
            var i, n = pat.statements.length, pattern, tr;
            for (i=0; i<n; i++) {
            pattern = pat.statements[i];
            tr = pattern.tr;
                    //tabulator.log.debug("tr: " + tr.AJAR_statement);
            if (typeof tr!='undefined')
            {
                    tr.AJAR_pattern = null; //TODO: is this == to whats in current version?
                    tr.AJAR_variable = null;
            }
            }
            for (x in pat.optional)
                    resetOutliner(pat.optional[x])
        }
        resetOutliner(q.pat);
        //NextVariable=0;
        return q;
    } // saveQuery

    /** benchmark a function **/
    benchmark.lastkbsize = 0;
    function benchmark(f) {
        var args = [];
        for (var i = arguments.length-1; i > 0; i--) args[i-1] = arguments[i];
        //tabulator.log.debug("BENCHMARK: args=" + args.join());
        var begin = new Date().getTime();
        var return_value = f.apply(f, args);
        var end = new Date().getTime();
        tabulator.log.info("BENCHMARK: kb delta: " + (kb.statements.length - benchmark.lastkbsize) 
                + ", time elapsed for " + f + " was " + (end-begin) + "ms");
        benchmark.lastkbsize = kb.statements.length;
        return return_value;
    } //benchmark
    
    ///////////////////////// Representing data
    //  Represent an object in summary form as a table cell
    function appendRemoveIcon(node, subject, removeNode) {
        var image = AJARImage(Icon.src.icon_remove_node, 'remove')
        // image.setAttribute('align', 'right')  Causes icon to be moved down
        image.node = removeNode
        image.setAttribute('about', subject.toNT())
        image.style.marginLeft="5px"
        image.style.marginRight="10px"
        //image.style.border="solid #777 1px"; 
        node.appendChild(image)
        return image
    }
    
    this.appendAccessIcon = function(node, term) {
        if (typeof term.termType == 'undefined') tabulator.log.error("??"+ term);
        if (term.termType != 'symbol') return '';
        if (term.uri.slice(0,5) != 'http:') return '';
        var state = sf.getState(term);
        var icon, alt, info;
        //    tabulator.log.debug("State of " + doc + ": " + state)
        switch (state) {
            case 'unrequested': 
                icon = Icon.src.icon_unrequested;
                alt = 'fetch';
            break;
            case 'requested':
                icon = Icon.src.icon_requested;
                alt = 'fetching';
            break;
            case 'fetched':
                icon = Icon.src.icon_fetched;
                alt = 'loaded';
            break;
            case 'failed':
                icon = Icon.src.icon_failed;
                alt = 'failed';
            break;
            case 'unpermitted':
                icon = Icon.src.icon_failed;
                alt = 'no perm';
            break;
            case 'unfetchable':
                icon = Icon.src.icon_failed;
                alt = 'cannot fetch';
            break;
            default:
                tabulator.log.error("?? state = " + state);
            break;
        } //switch
        var img = AJARImage(icon, alt, 
                            Icon.tooltips[icon].replace(/[Tt]his resource/,
                                                        term.uri))
        addButtonCallbacks(img,term)
        node.appendChild(img)
        return img
    } //appendAccessIcon
    
    //Six different Creative Commons Licenses:
    //1. http://creativecommons.org/licenses/by-nc-nd/3.0/ 
    //2. http://creativecommons.org/licenses/by-nc-sa/3.0/
    //3. http://creativecommons.org/licenses/by-nc/3.0/
    //4. http://creativecommons.org/licenses/by-nd/3.0/
    //5. http://creativecommons.org/licenses/by-sa/3.0/
    //6. http://creativecommons.org/licenses/by/3.0/
    
    /** make the td for an object (grammatical object) 
     *  @param obj - an RDF term
     *  @param view - a VIEW function (rather than a bool asImage)
     **/
     
     tabulator.options = {};
     
     tabulator.options.references = [];
     
     this.openCheckBox = function ()
     
     {
     
        display = window.open(" ",'NewWin','menubar=0,location=no,status=no,directories=no,toolbar=no,scrollbars=yes,height=200,width=200')
     
        display.tabulator = tabulator;
                                  
        var message="<font face='arial' size='2'><form name ='checkboxes'>";
                 
        if(tabulator.options.checkedLicenses[0]){    
            message+="<input type='checkbox' name = 'one' onClick = 'tabulator.options.submit()' CHECKED />CC: BY-NC-ND<br />";        
        }
        
        else{
            message+="<input type='checkbox' name = 'one' onClick = 'tabulator.options.submit()' />CC: BY-NC-ND<br />";
        }
        
        if(tabulator.options.checkedLicenses[1]){    
            message+="<input type='checkbox' name = 'two' onClick = 'tabulator.options.submit()' CHECKED />CC: BY-NC-SA<br />";        
        }
                
        else{
            message+="<input type='checkbox' name = 'two' onClick = 'tabulator.options.submit()' />CC: BY-NC-SA<br />";
        }
        if(tabulator.options.checkedLicenses[2]){    
            message+="<input type='checkbox' name = 'three' onClick = 'tabulator.options.submit()' CHECKED />CC: BY-NC<br />";        
        }
                
                else{
                    message+="<input type='checkbox' name = 'three' onClick = 'tabulator.options.submit()' />CC: BY-NC<br />";
        }
         if(tabulator.options.checkedLicenses[3]){    
                    message+="<input type='checkbox' name = 'four' onClick = 'tabulator.options.submit()' CHECKED />CC: BY-ND<br />";        
                }
                
                else{
                    message+="<input type='checkbox' name = 'four' onClick = 'tabulator.options.submit()' />CC: BY-ND<br />";
        }
         if(tabulator.options.checkedLicenses[4]){    
                    message+="<input type='checkbox' name = 'five' onClick = 'tabulator.options.submit()' CHECKED />CC: BY-SA<br />";        
                }
                
                else{
                    message+="<input type='checkbox' name = 'five' onClick = 'tabulator.options.submit()' />CC: BY-SA<br />";
        }
         if(tabulator.options.checkedLicenses[5]){    
                    message+="<input type='checkbox' name = 'six' onClick = 'tabulator.options.submit()' CHECKED />CC: BY<br />";        
                }
                
         else{
             message+="<input type='checkbox' name = 'six' onClick = 'tabulator.options.submit()' />CC: BY<br />";
        }
                 
        message+="<br /> <a onclick='tabulator.options.selectAll()'>[Select All] </a>";
                 
        message+="<a onclick='tabulator.options.deselectAll()'> [Deselect All]</a>";
     
        message+="</form></font>";
                 
        display.document.write(message);
                 
        display.document.close(); 
        
        tabulator.options.references[0] = display.document.checkboxes.one;
        tabulator.options.references[1] = display.document.checkboxes.two;
        tabulator.options.references[2] = display.document.checkboxes.three;
        tabulator.options.references[3] = display.document.checkboxes.four;
        tabulator.options.references[4] = display.document.checkboxes.five;
        tabulator.options.references[5] = display.document.checkboxes.six;
     
            }
    
    
    tabulator.options.checkedLicenses = [];
   
    tabulator.options.selectAll = function()
    {
        display.document.checkboxes.one.checked = true;
        display.document.checkboxes.two.checked = true;
        display.document.checkboxes.three.checked = true;
        display.document.checkboxes.four.checked = true;
        display.document.checkboxes.five.checked = true;
        display.document.checkboxes.six.checked = true;
        
        for(i=0; i<6; i++){
            tabulator.options.references[i].checked = true;
            tabulator.options.checkedLicenses[i] = true;
        }
        
    }
    
    tabulator.options.deselectAll = function()
    {
        display.document.checkboxes.one.checked = false;
        display.document.checkboxes.two.checked = false;
        display.document.checkboxes.three.checked = false;
        display.document.checkboxes.four.checked = false;
        display.document.checkboxes.five.checked = false;
        display.document.checkboxes.six.checked = false;
        
        for(i=0; i<6; i++){
                    tabulator.options.references[i].checked = false;
                    tabulator.options.checkedLicenses[i] = false;
        }
    
    }
    
    
    tabulator.options.submit = function()
    {   
    
        alert('tabulator.options.submit: checked='+tabulator.options.references[0].checked);
        
        for(i=0; i<6; i++)
        {
            if(tabulator.options.references[i].checked)
            {
                tabulator.options.checkedLicenses[i] = true;
            }
            else
            {
                tabulator.options.checkedLicenses[i] = false;
            }
        }
    }
        
       
    this.outline_objectTD = function outline_objectTD(obj, view, deleteNode, why) {
        tabulator.log.info("@outline_objectTD, myDocument is now " + this.document.location);
        var td = myDocument.createElementNS(HTML_NS,'td');
        var theClass = "obj";
                
        // check the IPR on the data
        var licenses = kb.each(why, kb.sym('http://creativecommons.org/ns#license'));
        tabulator.log.info('licenses:'+ why+': '+ licenses)
        for (i=0; i< licenses.length; i++) {
            if((tabulator.options.checkedLicenses[0] == true && licenses[i].uri == 'http://creativecommons.org/licenses/by-nc-nd/3.0/') || 
               (tabulator.options.checkedLicenses[1] == true && licenses[i].uri == 'http://creativecommons.org/licenses/by-nc-sa/3.0/') ||
               (tabulator.options.checkedLicenses[2] == true && licenses[i].uri == 'http://creativecommons.org/licenses/by-nc/3.0/') ||
               (tabulator.options.checkedLicenses[3] == true && licenses[i].uri == 'http://creativecommons.org/licenses/by-nd/3.0/') ||
               (tabulator.options.checkedLicenses[4] == true && licenses[i].uri == 'http://creativecommons.org/licenses/by-sa/3.0/') ||
               (tabulator.options.checkedLicenses[5] == true && licenses[i].uri == 'http://creativecommons.org/licenses/by/3.0/'))
            {
                theClass += ' licOkay';
                break;
            }
            
        }
        
              
        //set about
        if ((obj.termType == 'symbol') || (obj.termType == 'bnode'))
            td.setAttribute('about', obj.toNT());
            
         td.setAttribute('class', theClass);      //this is how you find an object
         tabulator.log.info('class on '+td)
         var check = td.getAttribute('class')
         tabulator.log.info('td has class:' + check)
         tabulator.log.info("selection has " +selection.map(function(item){return item.textContent;}).join(", "));             
         
        if (kb.whether(obj, tabulator.ns.rdf('type'), tabulator.ns.link('Request')))
            td.className='undetermined'; //@@? why-timbl
        if ((obj.termType == 'symbol') || (obj.termType == 'bnode')) {
            td.appendChild(AJARImage(Icon.src.icon_expand, 'expand'));
        } //expandable
        if (!view) // view should be a function pointer
            view = VIEWAS_boring_default;
        td.appendChild( view(obj) );    
        if (deleteNode) {
            appendRemoveIcon(td, obj, deleteNode)
        }

        try{var DDtd = new YAHOO.util.DDExternalProxy(td);}
        catch(e){tabulator.log.error("YAHOO Drag and drop not supported:\n"+e);}
        //set DOM methods
        td.tabulatorSelect = function (){setSelected(this,true);};
        td.tabulatorDeselect = function(){setSelected(this,false);};            
        //td.appendChild( iconBox.construct(document.createTextNode('bla')) );
        return td;
    } //outline_objectTD
    
    this.outline_predicateTD = function outline_predicateTD(predicate,newTr,inverse,internal){
        
        var td_p = myDocument.createElementNS(HTML_NS,'td');
                td_p.setAttribute('about', predicate.toNT())
        td_p.setAttribute('class', internal ? 'pred internal' : 'pred')
        
        switch (predicate.termType){
            case 'bnode': //TBD
                td_p.className='undetermined';
            case 'symbol': 
                var lab = predicateLabelForXML(predicate, inverse);
                break;
            case 'collection': // some choices of predicate
                lab = predicateLabelForXML(predicate.elements[0],inverse);
        }
        lab = lab.slice(0,1).toUpperCase() + lab.slice(1)
        //if (kb.statementsMatching(predicate,rdf('type'), tabulator.ns.link('Request')).length) td_p.className='undetermined';

        var labelTD = myDocument.createElementNS(HTML_NS,'td')
        labelTD.setAttribute('notSelectable','true')
        labelTD.appendChild(myDocument.createTextNode(lab))
        td_p.appendChild(labelTD);
        labelTD.style.width='100%'
        td_p.appendChild(termWidget.construct()); //termWidget is global???
        for (var w in Icon.termWidgets) {
            if(!newTr||!newTr.AJAR_statement) break; //case for TBD as predicate
                    //alert(Icon.termWidgets[w]+"   "+Icon.termWidgets[w].filter)
            if (Icon.termWidgets[w].filter
                && Icon.termWidgets[w].filter(newTr.AJAR_statement,'pred',
                                inverse))
                termWidget.addIcon(td_p,Icon.termWidgets[w])
        }

        try{var DDtd = new YAHOO.util.DDExternalProxy(td_p);}
        catch(e){tabulator.log.error("drag and drop not supported");}        
        //set DOM methods
        td_p.tabulatorSelect = function (){setSelected(this,true);};
        td_p.tabulatorDeselect = function(){setSelected(this,false);}; 
        return td_p;              
    } //outline_predicateTD

    function AJARImage(src, alt, tt) {
        if (!tt && Icon.tooltips[src]) tt = Icon.tooltips[src];
        //var sp = document.createElement('span')
        //var image = content.document.createElement('img')
        var image = myDocument.createElementNS('http://www.w3.org/1999/xhtml','img');
        image.setAttribute('src', src)
        if (typeof alt != 'undefined') image.setAttribute('alt', alt)
        if (typeof tt != 'undefined') image.setAttribute('title',tt)
        return image
    }
    ///////////////// Represent an arbirary subject by its properties
    //These are public variables
    expandedHeaderTR.tr = myDocument.createElementNS(HTML_NS,'tr');
    expandedHeaderTR.td = myDocument.createElementNS(HTML_NS,'td');
    expandedHeaderTR.td.setAttribute('colspan', '2');
    expandedHeaderTR.td.appendChild(AJARImage(Icon.src.icon_collapse, 'collapse',undefined,myDocument));
    expandedHeaderTR.td.appendChild(myDocument.createElementNS(HTML_NS,'strong'));
    expandedHeaderTR.tr.appendChild(expandedHeaderTR.td);
    
    function expandedHeaderTR(subject) {
        var tr = expandedHeaderTR.tr.cloneNode(true); //This sets the private tr as a clone of the public tr
        tr.firstChild.setAttribute('about', subject.toNT());
        tr.firstChild.childNodes[1].appendChild(myDocument.createTextNode(label(subject)));
        tr.firstPane = null;
        var relevantPanes = [];
        var labels = []
        for (var i=0; i< panes.list.length; i++) {
            var pane = panes.list[i];
            var lab = pane.label(subject);
            if (!lab) continue;
            relevantPanes.push(pane);
            labels.push(lab)
        }
        
        if (!relevantPanes) relevantPanes.push(internalPane);
        tr.firstPane = relevantPanes[0];
        if (relevantPanes.length != 1) { // if only one, simplify interface
            for (var i=0; i<relevantPanes.length; i++) {
                var pane = relevantPanes[i];
                var ico = AJARImage(pane.icon, labels[i], labels[i]);
                // ico.setAttribute('align','right');   @@ Should be better, but ffox bug pushes them down
                ico.setAttribute('class',  i ? 'paneHidden':'paneShown')
                tr.firstChild.childNodes[1].appendChild(ico);
            }
        }
        
        //set DOM methods
        tr.firstChild.tabulatorSelect = function (){setSelected(this,true);};
        tr.firstChild.tabulatorDeselect = function(){setSelected(this,false);};   
        return tr;
    } //expandedHeaderTR

/////////////////////////////////////////////////////////////////////////////

    /*  PANES
    **
    **     Panes are regions of the outline view in which a particular subject is
    ** displayed in a particular way.  They are like views but views are for query results.
    ** subject panes are currently stacked vertically.
    */
    panes = {}
    panes.list = [];
    panes.paneForIcon = []
    panes.paneForPredicate = []
    panes.register = function(p) {
        panes.list.push(p);
        if (p.icon) panes.paneForIcon[p.icon] = p;
        if (p.predicates) {
            for (x in p.predicates) {
                panes.paneForPredicate[x] = {pred: x, code: p.predicates[x]};
            }
        }
    }
    
    ///////////////////////  Specific panes folow. 
    //
    // The default pane sed is the first one registerd for which the label
    //  method 
    // Those registered first take priority as a default pane.
    // That is, those earlier in this file
    
    /*   Class member Pane
    **
    **  This outline pane contains lists the members of a class
    */
    classInstancePane = {};
    classInstancePane.icon = Icon.src.icon_instances;
    classInstancePane.label = function(subject) {
        var n = kb.statementsMatching(
            undefined, tabulator.ns.rdf( 'type'), subject).length;
        if (n == 0) return null;
        return "List "+n;
    }

    classInstancePane.render = function(subject) {
        var div = myDocument.createElementNS(HTML_NS,"div")
        div.setAttribute('class', 'instancePane');
        var sts = kb.statementsMatching(undefined, tabulator.ns.rdf( 'type'), subject)
        if (sts.length > 10) {
            var tr = myDocument.createElementNS(HTML_NS,'tr');
            tr.appendChild(myDocument.createTextNode(''+sts.length));
            tr.AJAR_statement=sts[i];
            div.appendChild(tr);
        }

        // Don't need to check in the filter as the plist is already trimmed
        var plist = kb.statementsMatching(undefined, tabulator.ns.rdf( 'type'), subject)
        appendPropertyTRs(div, plist, true, function(pred){return true;})
        return div;
    }
    panes.register(classInstancePane);


    /*   Friend-of-a-Fried Pane
    **
    **  This outline pane provides social network functions
    */
    socialPane = {};
    socialPane.icon = Icon.src.icon_foaf;
    socialPane.label = function(subject) {
        if (!kb.whether(
            subject, tabulator.ns.rdf( 'type'), tabulator.ns.foaf('Person'))) return null;
        return "Friends";
    }

    socialPane.render = function(s) {
        var div = myDocument.createElementNS(HTML_NS,"div")
        div.setAttribute('class', 'socialPane');
        var foaf = tabulator.ns.foaf;
        // Image top right
        var src = kb.any(s, foaf('img'));
        if (!src) src = kb.any(s, foaf('depiction'));
        if (src) {
            var img = myDocument.createElementNS(HTML_NS,"img")
            img.setAttribute('src', src.uri) // w640 h480
            img.class = 'foafPic';
            div.appendChild(img)
        }
        var name = kb.any(s, foaf('name'));
        if (!name) name = '???';
        var h3 = myDocument.createElementNS(HTML_NS,"H3");
        h3.appendChild(myDocument.createTextNode(name));

        var me_uri = getCookie('me');
        var me = me_uri? kb.sym(me_uri) : null;
        var div2 = myDocument.createElementNS(HTML_NS,"div");
        tabulator.options.setMe = function(uri) {
            setCookie('me', uri ? uri : '', '3007-01-06');
            alert('Your own URI is now ' + (uri?uri:'reset. To set it again, find yourself and check "This is you".'));
        }
        if (!me || me_uri == s.uri) {  // If we know who me is, don't ask for other people
            var f = myDocument.createElementNS(HTML_NS,'form');
            div.appendChild(f);
            var input = myDocument.createElementNS(HTML_NS,'input');
            f.appendChild(input);
            var tx = myDocument.createTextNode("This is you");
            tx.className = 'question';
            f.appendChild(tx);
            var myHandler = function(e) {
                // alert('this.checked='+this.checked);
                var uri = this.checked? s.uri : '';
                setCookie('me', uri, '3007-01-06');
                alert('Your own URI is now ' + (uri?uri:'reset. To set it again, find yourself and check "This is you".'));
            }
            input.setAttribute('type', 'checkbox');
            input.checked = (me_uri == s.uri);
            input.addEventListener('click', myHandler, false);
        }
        var common = function(x,y) { // Find common members of two lists
//            var dict = [];
            var both = [];
            for(var i=0; i<x.length; i++) {
//                dict[x[i].uri] = true;
                for(var j=0; j<y.length; j++) {
                    if (y[j].sameTerm(x[i])) {
                        both.push(y[j]);
                        break;
                    }
                }

            }
            return both;
        }
        var plural = function(n, s) {
            var res = ' ';
            res+= (n ? n : 'No');
            res += ' ' + s;
            if (n != 1) res += 's';
            return res;
        }
        
        var people = function(n) {
            var res = ' ';
            res+= (n ? n : 'no');
            if (n == 1) return res + ' person';
            return res + ' people';
        }
        var say = function(str) {
            var tx = myDocument.createTextNode(str);
            var p = myDocument.createElementNS(HTML_NS,'p');
            p.appendChild(tx);
            div.appendChild(p);
        }
        
        var buildCheckboxForm = function(lab, statement, state) {
            var f = myDocument.createElementNS(HTML_NS,'form');
            var input = myDocument.createElementNS(HTML_NS,'input');
            f.appendChild(input);
            var tx = myDocument.createTextNode(lab);
            tx.className = 'question';
            f.appendChild(tx);
            input.setAttribute('type', 'checkbox');
            var boxHandler = function(e) {
                tx.className = 'pendingedit';
                alert('Should be greyed out')
                if (this.checked) { // Add link
                    try {
                        thisOutline.UserInput.sparqler.insert_statement(statement, function(uri,success,error_body) {
                            tx.className = 'question';
                            if (!success){
                                alert("Error occurs while inserting "+statement+'\n\n'+error_body);
                                input.checked = false; //rollback UI
                                return;
                            }
                            kb.add(statement.subject, statement.predicate, statement.object, statement.why);                        
                        })
                    }catch(e){
                        alert("Data write fails:" + e);
                        input.checked = false; //rollback UI
                        tx.className = 'question';
                    }
                } else { // Remove link
                    try {
                        thisOutline.UserInput.sparqler.delete_statement(statement, function(uri,success,error_body) {
                            tx.className = 'question';
                            if (!success){
                                alert("Error occurs while deleting "+statement+'\n\n'+error_body);
                                this.checked = true; // Rollback UI
                            } else {
                                kb.removeMany(statement.subject, statement.predicate, statement.object, statement.why);
                            }
                        })
                    }catch(e){
                        alert("Delete fails:" + e);
                        this.checked = true; // Rollback UI
                        return;
                    }
                }
            }
            input.checked = state;
            input.addEventListener('click', boxHandler, false)
            return f;
        }
        
        var knows = foaf('knows');
//        var givenName = kb.sym('http://www.w3.org/2000/10/swap/pim/contact#givenName');
        var familiar = kb.any(s, foaf('givenname')) || kb.any(s, foaf('firstName')) ||
                    kb.any(s, foaf('nick')) || kb.any(s, foaf('name'));
        if (familiar) familiar = familiar.value;
        var friends = kb.each(s, knows);
        
        // Do I have a public profile document?
        var profile = null; // This could be  SPARQL
        var editable = false;
        if (me) {
            var works = kb.each(undefined, foaf('primaryTopic'), me)
            for (var i=0; i<works.length; i++) {
                if (kb.whether(works[i], rdf('type'),
                                            foaf('PersonalProfileDocument'))) {
                    profile = works[i];
                    break;
                }
            }
            if (profile) editable = outline.sparql.prototype.editable(profile.uri, kb)
            if (me_uri == s.uri ) { // This is about me
                if (!profile) {
                    say("I couldn't find your personal profile document.");
                } else if (!editable) {
                    say("Your profile <"+profile.uri+"> is not remotely editable.");
                } else  {
                    say("Editing your profile <"+profile.uri+">.");
                }
            } else { // This is about someone else
                // My relationship with this person
                var incoming = kb.whether(s, knows, me);
                var outgoing = false;
                var outgoingSt = kb.statementsMatching(me, knows, s);
                if (outgoingSt.length) {
                    outgoing = true;
                    if (!profile) profile = outgoingSt.why;
                } // Do I have an EDITABLE profile?
                if (profile) editable = outline.sparql.prototype.editable(profile.uri, kb)

                var msg = 'You and '+familiar
                if (!incoming) {
                    if (!outgoing) {
                        msg = msg + ' do not know each other.';
                    } else {
                        msg = 'You know '+familiar+ ' (unconfirmed)';
                    }
                } else {
                    if (!outgoing) {
                        msg = familiar + ' knows you (unconfirmed).';
                    } else {
                        msg = msg + ' know each other.';
                    }
                }
                var tr = myDocument.createElementNS(HTML_NS,'tr');
                div.appendChild(tr);
                tr.appendChild(myDocument.createTextNode(msg))


                if (editable) {
                    var f = buildCheckboxForm("You know " + familiar,
                            new RDFStatement(me, knows, s, profile), outgoing)
                    div.appendChild(f);
                } // editable
                 
                if (friends) {
                    var myFriends = kb.each(me, foaf('knows'));
                    // div.appendChild(myDocument.createTextNode( '(You have '+myFriends.length+' acqaintances.) '))
                    if (myFriends) {
                        var mutualFriends = common(friends, myFriends);
                        var tr = myDocument.createElementNS(HTML_NS,'tr');
                        div.appendChild(tr);
                        tr.appendChild(myDocument.createTextNode(
                                    'You'+ (familiar? ' and '+familiar:'') +' know'+
                                    people(mutualFriends.length)+' in common'))
                        if (mutualFriends) {
                            for (var i=0; i<mutualFriends.length; i++) {
                                tr.appendChild(myDocument.createTextNode(
                                    ',  '+ label(mutualFriends[i])));
                            }
                        }
                    }
                    var tr = myDocument.createElementNS(HTML_NS,'tr');
                    div.appendChild(tr);
                } // friends
            } // About someone else
        } // me is defined
        
        // div.appendChild(myDocument.createTextNode(plural(friends.length, 'acqaintance') +'. '));

        var plist = kb.statementsMatching(s, knows)
        appendPropertyTRs(div, plist, false, function(pred){return true;})

        return div;
    }
    
    //var me_uri = getCookie('me');   // Load my friend list straight away .. @@kludge
    //if (me_uri) sf.lookUpThing(kb.sym(me_uri));
    
//    panes.register(socialPane); // later


    /*      Data content Pane
    **
    **  This pane shows the content of a particular RDF resource
    ** or at least the RDF semantics we attribute to that resource.
    */

    // To do:  - Only take data from one graph
    //         - Only do forwards not backward?
    //         - Expand automatically all the way down
    //         - original source view?  Use ffox view source

    dataContentPane = {};
    dataContentPane.icon = Icon.src.icon_dataContents;
    dataContentPane.label = function(subject) {
        var n = kb.statementsMatching(
            undefined, undefined, undefined, subject).length;
        if (n == 0) return null;
        return "Data ("+n+")";
    }

    // View the data in a file in user-friendly way
    dataContentPane.render = function(subject) {
        var div = myDocument.createElementNS(HTML_NS,"div")
        div.setAttribute('class', 'dataContentPane');
        // Because of smushing etc, this will not be a copy of the original source
        // We could instead either fetch and re-parse the source,
        // or we could keep all the pre-smushed triples.
        var sts = kb.statementsMatching(undefined, undefined, undefined, subject); // @@ slow with current store!
        if (1) {
            div.appendChild(statementsAsTables(sts));
            
        } else {  // An outline mode openable rendering .. might be better
            var sz = Serializer();
            var res = sz.rootSubjects(sts);
            var roots = res[0]
            var p  = {};
            // p.icon = dataContentPane.icon
            p.render = function(s2) {
                var div = myDocument.createElementNS(HTML_NS,'div')
                
                div.setAttribute('class', 'withinDocumentPane')
                var plist = kb.statementsMatching(s2, undefined, undefined, subject)
                appendPropertyTRs(div, plist, false, withinDocumentPane.filter)
                return div    
            }
            for (var i=0; i<roots.length; i++) {
                var tr = myDocument.createElementNS(HTML_NS,"tr");
                root = roots[i];
                tr.style.verticalAlign="top";
                var td = thisOutline.outline_objectTD(root, undefined, tr)
                tr.appendChild(td)
                div.appendChild(tr);
                outline_expand(td, root,  p);
            }
        }
        return div
    }
    panes.register(dataContentPane);



    /*   Pane within Document data content view
    **
    **  This outline pane contains docuemnts from a specific source document only.
    */
    withinDocumentPane = {};
    withinDocumentPane.icon = Icon.src.icon_withinDocumentPane; // should not show
    withinDocumentPane.label = function(subject) { return 'doc contents';};
    withinDocumentPane.filter = function(pred, inverse) {
        return true; // show all
    }
    withinDocumentPane.render = function(subject, source) {
        var div = myDocument.createElementNS(HTML_NS,'div')
        
        div.setAttribute('class', 'withinDocumentPane')
//        appendRemoveIcon(div, subject, div);
                  
        var plist = kb.statementsMatching(subject, undefined, undefined, source)
        appendPropertyTRs(div, plist, false, withinDocumentPane.filter)
        return div    
    }
    // panes.register(withinDocumentPane);
    
    /*   Default Pane
    **
    **  This outline pane contains the properties which are
    **  normaly displayed to the user. See also: innternalPane
    */
    var defaultPane = {};
    defaultPane.icon = Icon.src.icon_defaultPane;
    defaultPane.label = function(subject) { return 'about ';};
    defaultPane.filter = function(pred, inverse) {
        if (typeof internalPane.predicates[pred.uri] != 'undefined')
            return false;
        if (inverse && (pred.uri == 
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")) return false;
        return true;
    }
    defaultPane.render = function(subject) {
        var div = myDocument.createElementNS(HTML_NS,'div')
        
        div.setAttribute('class', 'defaultPane')
//        appendRemoveIcon(div, subject, div);
                  
        var plist = kb.statementsMatching(subject)
        appendPropertyTRs(div, plist, false, defaultPane.filter)
        plist = kb.statementsMatching(undefined, undefined, subject)
        appendPropertyTRs(div, plist, true, defaultPane.filter)
        if (outline.sparql.prototype.editable(subject.uri, outline.kb) && // Is that the only test?
            !HCIoptions["bottom insert highlights"].enabled) {
            var holdingTr = myDocument.createElementNS(HTML_NS,'tr'); //these are to minimize required changes
            var holdingTd = myDocument.createElementNS(HTML_NS,'td'); //in userinput.js
            holdingTd.setAttribute('colspan','2');
            holdingTd.setAttribute('notSelectable','true');
            var img = myDocument.createElementNS(HTML_NS,'img');
            img.src = Icon.src.icon_add_new_triple;
            img.className='bottom-border-active'
            //img.addEventListener('click',thisOutline.UserInput.borderClick,false);
            div.appendChild(holdingTr).appendChild(holdingTd).appendChild(img);          
        }        
        return div    
    }
    panes.register(defaultPane);
    
    /*   Internal Pane
    **
    **  This outline pane contains the properties which are
    ** internal to the user's interaction with the web, and are not normaly displayed
    */
    internalPane = {};
    internalPane.icon = Icon.src.icon_internals;
    internalPane.label = function(subject) {
        var sts = kb.statementsMatching(subject);
        sts = sts.concat(kb.statementsMatching(undefined, undefined, subject));
        for (var i=0; i<sts.length; i++) {
            if (internalPane.predicates[sts[i].predicate.uri] == 1) // worth displaing
                return "under the hood";
        }
        return null
    }
    internalPane.render = function(subject) {
        function filter(pred, inverse) {
            return  !!(typeof internalPane.predicates[pred.uri] != 'undefined');
        }
        var div = myDocument.createElementNS(HTML_NS,'div')
        div.setAttribute('class', 'internalPane')
//        appendRemoveIcon(div, subject, div);
                  
        var plist = kb.statementsMatching(subject)
        if (subject.uri) plist.push(new RDFStatement(subject,
                    kb.sym('http://www.w3.org/2006/link#uri'), subject.uri));
        appendPropertyTRs(div, plist, false, filter)
        plist = kb.statementsMatching(undefined, undefined, subject)
        appendPropertyTRs(div, plist, true, filter)    
        return div
    }
    internalPane.predicates = {// Predicates used for inner workings. Under the hood
        'http://www.w3.org/2007/ont/link#request': 1,
        'http://www.w3.org/2007/ont/link#requestedBy': 1,
        'http://www.w3.org/2007/ont/link#source': 1,
        'http://www.w3.org/2007/ont/link#session': 2, // 2=  test neg but display
        'http://www.w3.org/2006/link#uri': 1,
        'http://www.w3.org/2006/link#Document': 1,
    }
    internalPane.predicates[tabulator.ns.link('all').uri] = 1;  // From userinput.js
    if (!SourceOptions["seeAlso not internal"].enabled)
        internalPane.predicates['http://www.w3.org/2000/01/rdf-schema#seeAlso'] = 1;
    
    panes.register(internalPane);
    panes.register(socialPane);
    
    
    /*   Human-readable Pane
    **
    **  This outline pane contains the document contents for an HTML document
    */
    humanReadablePane = {};
    humanReadablePane.icon = Icon.src.icon_visit;
    humanReadablePane.label = function(subject) {
        if (!kb.anyStatementMatching(
            subject, tabulator.ns.rdf( 'type'), tabulator.ns.link( 'TextDocument')))
            return null;
        var s = dataContentPane.label(subject);
        // Done to stop Tab'r trying to show nestd RDF and N3 files in Firefox
        if (s) return null; // If a data document, don't try human readable view.  (?)
        return "view";
    }
    humanReadablePane.render = function(subject) {
        var div = myDocument.createElementNS(HTML_NS,"div")
    
        div.setAttribute('class', 'docView')    
        var iframe = myDocument.createElementNS(HTML_NS,"IFRAME")
        iframe.setAttribute('src', subject.uri)
        iframe.setAttribute('class', 'doc')
        iframe.setAttribute('height', '480')
        iframe.setAttribute('width', '640')
        var tr = myDocument.createElementNS(HTML_NS,'tr')
        tr.appendChild(iframe)
        div.appendChild(tr)
        return div
    }
    panes.register(humanReadablePane);


/*   Image Pane
    **
    **  This outline pane contains the document contents for an HTML document
    */
    imagePane = {};
    imagePane.icon = Icon.src.icon_imageContents;
    imagePane.label = function(subject) {
        if (!kb.anyStatementMatching(
            subject, tabulator.ns.rdf( 'type'),
            kb.sym('http://purl.org/dc/terms/Image'))) // NB: Not dc: namespace!
            return null;
        return "view";
    }
    imagePane.render = function(subject) {
        var div = myDocument.createElementNS(HTML_NS,"div")
        div.setAttribute('class', 'imageView')
        var img = myDocument.createElementNS(HTML_NS,"IMG")
        img.setAttribute('src', subject.uri) // w640 h480
        div.style['max-width'] = '640';
        div.style['max-height'] = '480';
        var tr = myDocument.createElementNS(HTML_NS,'tr')  // why need tr?
        tr.appendChild(img)
        div.appendChild(tr)
        return div
    }
    panes.register(imagePane);


    /*      Notation3 content Pane
    **
    **  This pane shows the content of a particular RDF resource
    ** or at least the RDF semantics we attribute to that resource,
    ** in generated N3 syntax.
    */
    n3Pane = {};
    n3Pane.icon = Icon.src.icon_n3Pane;
    n3Pane.label = function(subject) {
        var s = dataContentPane.label(subject);
        if (!s) return null;
        return s + ' as N3';
    }

    n3Pane.render = function(subject) {
        var div = myDocument.createElementNS(HTML_NS,"div")
        div.setAttribute('class', 'n3Pane');
        // Because of smushing etc, this will not be a copy of the original source
        // We could instead either fetch and re-parse the source,
        // or we could keep all the pre-smushed triples.
        var sts = kb.statementsMatching(undefined, undefined, undefined, subject); // @@ slow with current store!
        /*
        var kludge = kb.formula([]); // No features
        for (var i=0; i< sts.length; i++) {
            s = sts[i];
            kludge.add(s.subject, s.predicate, s.object);
        }
        */
        var sz = Serializer();
        sz.suggestNamespaces(kb.namespaces);
        sz.setBase(subject.uri);
        var str = sz.statementsToN3(sts)
        var pre = myDocument.createElementNS(HTML_NS,'PRE');
        pre.appendChild(myDocument.createTextNode(str));
        div.appendChild(pre);
        return div
    }
    panes.register(n3Pane);

    /*      RDF/XML content Pane
    **
    **  This pane shows the content of a particular RDF resource
    ** or at least the RDF semantics we attribute to that resource,
    ** in generated N3 syntax.
    */
    RDFXMLPane = {};
    RDFXMLPane.icon = Icon.src.icon_RDFXMLPane;
    RDFXMLPane.label = function(subject) {
        var s = dataContentPane.label(subject);
        if (!s) return null;
        return s + ' as RDF/XML';
    }

    RDFXMLPane.render = function(subject) {
        var div = myDocument.createElementNS(HTML_NS,"div")
        div.setAttribute('class', 'RDFXMLPane');
        // Because of smushing etc, this will not be a copy of the original source
        // We could instead either fetch and re-parse the source,
        // or we could keep all the pre-smushed triples.
        var sts = kb.statementsMatching(undefined, undefined, undefined, subject); // @@ slow with current store!
        /*
        var kludge = kb.formula([]); // No features
        for (var i=0; i< sts.length; i++) {
            s = sts[i];
            kludge.add(s.subject, s.predicate, s.object);
        }
        */
        var sz = Serializer();
        sz.suggestNamespaces(kb.namespaces);
        sz.setBase(subject.uri);
        var str = sz.statementsToXML(sts)
        var pre = myDocument.createElementNS(HTML_NS,'PRE');
        pre.appendChild(myDocument.createTextNode(str));
        div.appendChild(pre);
        return div
    }
    panes.register(RDFXMLPane);


  
     /** AIR (Amord in RDF) Pane
     *
     * This pane will display the justification trace of a when it encounters 
     * air reasoner output
     */
     
    airPane = {};
    airPane.icon = Icon.src.icon_airPane;
     
    var air = RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/air#");
    var tms = RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/tms#");
    var compliant = air('compliant-with');
    var nonCompliant = air('non-compliant-with');
    var antcExpr = tms('antecedent-expr');
    var just = tms('justification');
    var subExpr = tms('sub-expr');
    var description = tms('description');
    var ruleName = tms('rule-name');
    var prem = tms('premise');
    var stsCompliant;
    var stsNonCompliant;
    var airRet = null;
    var stsJust;
    var ruleNameFound;
             
    airPane.label = function(subject) {
    
        stsJust = kb.statementsMatching(undefined, just, undefined, subject); 

            for (var j=0; j<stsJust.length; j++){
                if (stsJust[j].subject.termType == 'formula'){
                var sts = stsJust[j].subject.statements;
                for (var k=0; k<sts.length; k++){
                    if (sts[k].predicate.toString() == compliant.toString()){
                        airRet = "AIR";
                        stsCompliant = sts[k];
                    
                    } 
                    if (sts[k].predicate.toString() == nonCompliant.toString()){
                        airRet = "AIR";
                        stsNonCompliant = sts[k];
                        
                     }
                   }
                }    
            }
        
       return airRet;
    }

    // View the justification trace in an exploratory manner
    airPane.render = function(subject) {
        
        var stsFound;
         
        var divClass;
        var div = myDocument.createElementNS(HTML_NS,"div");
        div.setAttribute('class', 'dataContentPane'); //airPane has the same formatting as the dataContentPane
        div.setAttribute('id', 'dataContentPane'); //airPane has the same formatting as the dataContentPane

        var divOutcome = myDocument.createElementNS(HTML_NS,"div"); 
        if (stsNonCompliant != undefined){
            divClass = 'nonCompliantPane';
            stsFound =  stsNonCompliant;
        }
        if (stsCompliant != undefined){
            divClass = 'compliantPane';
            stsFound =  stsCompliant;
        }

        
        if (stsFound != undefined){

            divOutcome.setAttribute('class', divClass);
            divOutcome.setAttribute('id', 'outcome');
        
            var table = myDocument.createElementNS(HTML_NS,"table");
            var tr = myDocument.createElementNS(HTML_NS,"tr");
            
            var td_intro = myDocument.createElementNS(HTML_NS,"td");
            td_intro.appendChild(myDocument.createTextNode('The reason '));
            tr.appendChild(td_intro);

            var td_s = myDocument.createElementNS(HTML_NS,"td");
            var a_s = myDocument.createElementNS(HTML_NS,'a')
            a_s.setAttribute('href', stsFound.subject.uri)
            a_s.appendChild(myDocument.createTextNode(label(stsFound.subject)));
            td_s.appendChild(a_s);
            tr.appendChild(td_s);

            var td_is = myDocument.createElementNS(HTML_NS,"td");
            td_is.appendChild(myDocument.createTextNode(' is '));
            tr.appendChild(td_is);

            var td_p = myDocument.createElementNS(HTML_NS,"td");
            var a_p = myDocument.createElementNS(HTML_NS,'a')
            a_p.setAttribute('href', stsFound.predicate.uri)
            a_p.appendChild(myDocument.createTextNode(label(stsFound.predicate)));
            td_p.appendChild(a_p);
            tr.appendChild(td_p);

            var td_o = myDocument.createElementNS(HTML_NS,"td");
            var a_o = myDocument.createElementNS(HTML_NS,'a')
            a_o.setAttribute('href', stsFound.object.uri)
            a_o.appendChild(myDocument.createTextNode(label(stsFound.object)));
            td_o.appendChild(a_o);
            tr.appendChild(td_o);

           	var td_end = myDocument.createElementNS(HTML_NS,"td");
            td_end.appendChild(myDocument.createTextNode(' is because: '));
            tr.appendChild(td_end);

            table.appendChild(tr);
            divOutcome.appendChild(table);
            div.appendChild(divOutcome);
            
            var hideButton = myDocument.createElementNS(HTML_NS,'input');
            hideButton.setAttribute('type','button');
            hideButton.setAttribute('id','hide');
            hideButton.setAttribute('value','Start Over');
        }

        airPane.render.addInitialButtons = function(){
 
	 		//Create and append the 'Why?' button        
	        var becauseButton = myDocument.createElementNS(HTML_NS,'input');
	        becauseButton.setAttribute('type','button');
	        becauseButton.setAttribute('id','whyButton');
	        becauseButton.setAttribute('value','Why?');
	        div.appendChild(becauseButton);
	        becauseButton.addEventListener('click',airPane.render.because,false);
				        		
	        div.appendChild(myDocument.createTextNode('   '));//To leave some space between the 2 buttons, any better method?
	        
	        //Create and append the 'Lawyer's View' button
	        var lawyerButton = myDocument.createElementNS(HTML_NS,'input');
	        lawyerButton.setAttribute('type','button');
	        lawyerButton.setAttribute('id','lawyerButton');
	        lawyerButton.setAttribute('value','Lawyer\'s View');
	        div.appendChild(lawyerButton);
	        lawyerButton.addEventListener('click',airPane.render.lawyer,false);
        	
        }
        
        airPane.render.hide = function(){
        
        	//Remove the justification div from the pane
            var d = myDocument.getElementById('dataContentPane');
            var j = myDocument.getElementById('justification');
            var b = myDocument.getElementById('hide');
            var m = myDocument.getElementById('more');
            if (d != null && m != null){
                d.removeChild(m);
            }
            if (d != null && j != null && b != null){
                d.removeChild(j);
                d.removeChild(b);
            }

			airPane.render.addInitialButtons();
			            
        }

        airPane.render.lawyer = function(){
        	alert('Inside lawyer');
        }

        airPane.render.because = function(){
        	
        	//Disable the 'why' and 'lawyer's view' buttons... If not, it creates a mess if accidentally pressed
           var whyButton = myDocument.getElementById('whyButton');
           var lawyerButton = myDocument.getElementById('lawyerButton');
            var d = myDocument.getElementById('dataContentPane');
    		if (d != null && whyButton != null)
            	d.removeChild(whyButton);
    		if (d != null && lawyerButton != null)
            	d.removeChild(lawyerButton);

            airPane.render.because.moreInfo = function(ruleToFollow){

				//Terminating condition: 
				// if the rule has for example - "pol:MA_Disability_Rule_1 tms:justification tms:premise"
				// there are no more information to follow
				var terminatingCondition = kb.statementsMatching(ruleToFollow, just, prem, subject);
				if (terminatingCondition[0] != undefined){

				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
					divPremises.appendChild(myDocument.createTextNode("No more information is available from the reasoner!"));
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
			   
				}
				else{
					
					//Update the description div with the description at the next level
	                var currentRule = kb.statementsMatching(ruleToFollow, undefined, undefined, subject);
	                airPane.render.because.displayDesc(currentRule[0].object);
	            	divDescription.appendChild(myDocument.createElementNS(HTML_NS,'br')); 
				   	divDescription.appendChild(myDocument.createElementNS(HTML_NS,'br'));
				   	
	                var currentRuleSts = kb.statementsMatching(currentRule[0].subject, just, undefined, subject);
				   	var nextRuleSts = kb.statementsMatching(currentRuleSts[0].object, ruleName, undefined, subject);
				   	ruleNameFound = nextRuleSts[0].object;

				   	
				   	//Update the premises div also with the corresponding premises
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br')); 
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br')); 
				   var t1 = kb.statementsMatching(currentRuleSts[0].object, antcExpr, undefined);
                    for (var k=0; k<t1.length; k++){
	                        var t2 = kb.statementsMatching(t1[k].object, undefined, undefined);
	                        for (var l=0; l<t2.length; l++){
	                            if (t2[l].subject.termType == 'bnode' && t2[l].object.termType == 'formula'){
	                                justificationSts = t2;
	                                divPremises.appendChild(statementsAsTables(t2[l].object.statements)); 
	                            }                
	                       }     
	                }
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
						
				}
            				   	
            }
            
            airPane.render.because.justify = function(){
            
            	//Clear the contents of the div
            	myDocument.getElementById('premises').innerHTML='';
				airPane.render.because.moreInfo(ruleNameFound);            	

                divJustification.appendChild(divPremises);
            	div.appendChild(divJustification);
    
            }

			//Add the More Information Button
			var justifyButton = myDocument.createElementNS(HTML_NS,'input');
   			justifyButton.setAttribute('type','button');
            justifyButton.setAttribute('id','more');
            justifyButton.setAttribute('value','More Information');
            justifyButton.addEventListener('click',airPane.render.because.justify,false);
            div.appendChild(justifyButton);
			        		
            div.appendChild(myDocument.createTextNode('   '));//To leave some space between the 2 buttons, any better method?
            div.appendChild(myDocument.createTextNode('   '));

            div.appendChild(hideButton);
            hideButton.addEventListener('click',airPane.render.hide,false);

            var divJustification = myDocument.createElementNS(HTML_NS,"div");
            divJustification.setAttribute('class', 'justification');
            divJustification.setAttribute('id', 'justification');

            var divDescription = myDocument.createElementNS(HTML_NS,"div");
            divDescription.setAttribute('class', 'description');
            divDescription.setAttribute('id', 'description');
            
            var divPremises = myDocument.createElementNS(HTML_NS,"div");
            divPremises.setAttribute('class', 'premises');
            divPremises.setAttribute('id', 'premises');
            
			
            var justificationSts;
            
            airPane.render.because.displayDesc = function(obj){
            	for (var i=0; i<obj.elements.length; i++) {
			            switch(obj.elements[i].termType) {
			                case 'symbol':
			                    var anchor = myDocument.createElementNS(HTML_NS,'a')
			                    anchor.setAttribute('href', obj.elements[i].uri)
			                    anchor.appendChild(myDocument.createTextNode(label(obj.elements[i])));
			                    divDescription.appendChild(anchor);
			                    
			                case 'literal':
			                	if (obj.elements[i].value != undefined)
			                    	divDescription.appendChild(myDocument.createTextNode(obj.elements[i].value)); 
			            }       
					}
            }
            

		   //Display the actual English-like description first
        	var stsDesc = kb.statementsMatching(undefined, description, undefined, subject); 

	        divJustification.appendChild(myDocument.createElementNS(HTML_NS,'br'));

            for (var j=0; j<stsDesc.length; j++){
                if (stsDesc[j].subject.termType == 'formula' && stsDesc[j].object.termType == 'collection'){
					divJustification.appendChild(myDocument.createElementNS(HTML_NS,'b').appendChild(myDocument.createTextNode('Because:')));
				    divDescription.appendChild(myDocument.createElementNS(HTML_NS,'br'));
					airPane.render.because.displayDesc(stsDesc[j].object);
				    divDescription.appendChild(myDocument.createElementNS(HTML_NS,'br'));
			        divDescription.appendChild(myDocument.createElementNS(HTML_NS,'br'));
                }
                divJustification.appendChild(divDescription);
                
            }	
			
            div.appendChild(divJustification);

		    divJustification.appendChild(myDocument.createElementNS(HTML_NS,'br'));
	        divJustification.appendChild(myDocument.createElementNS(HTML_NS,'br'));
			divJustification.appendChild(myDocument.createElementNS(HTML_NS,'b').appendChild(myDocument.createTextNode('Premises:')));
		    divJustification.appendChild(myDocument.createElementNS(HTML_NS,'br'));
	        divJustification.appendChild(myDocument.createElementNS(HTML_NS,'br'));
            
            for (var j=0; j<stsJust.length; j++){
                if (stsJust[j].subject.termType == 'formula' && stsJust[j].object.termType == 'bnode'){
                
                	var ruleNameSts = kb.statementsMatching(stsJust[j].object, ruleName, undefined);
                	ruleNameFound =	ruleNameSts[0].object; // This would be the initial rule name from the 
                										   // statement containing the formula		
           		   	
                    var t1 = kb.statementsMatching(stsJust[j].object, antcExpr, undefined);
                    for (var k=0; k<t1.length; k++){
                        var t2 = kb.statementsMatching(t1[k].object, undefined, undefined);
                        for (var l=0; l<t2.length; l++){
                            if (t2[l].subject.termType == 'bnode' && t2[l].object.termType == 'formula'){
                                justificationSts = t2;
                                divPremises.appendChild(statementsAsTables(t2[l].object.statements)); 
                            }
                            else{
                            	var cwa = air('closed-world-assumption');
                        		var t3 = kb.statementsMatching(undefined, cwa, undefined);
                            }                
                       }     
                    }
                }
            }
            divJustification.appendChild(divPremises);    
        }

		//Create a table and append the 2 buttons into that
		var table = myDocument.createElementNS(HTML_NS,'table');
		var tr_b = myDocument.createElementNS(HTML_NS,'tr');
		var td_w = myDocument.createElementNS(HTML_NS,'td');
		var td_l = myDocument.createElementNS(HTML_NS,'td');

		airPane.render.addInitialButtons();

        return div;
    }
    panes.register(airPane);

//////////////////////////////////////////////////////////////////////////////

    // Remove a node from the DOM so that Firefox refreshes the screen OK
    // Just deleting it cause whitespace to accumulate.
    removeAndRefresh = function(d) {
        var table = d.parentNode
        var par = table.parentNode
        var placeholder = myDocument.createElementNS(HTML_NS,'table')
        par.replaceChild(placeholder, table)
        table.removeChild(d);
        par.replaceChild(table, placeholder) // Attempt to 
    }

    function propertyTable(subject, table, pane) {
        tabulator.log.debug("Property table for: "+ subject)
        subject = kb.canon(subject)
        if (!pane) pane = defaultPane;
        
        if (!table) { // Create a new property table
            var table = myDocument.createElementNS(HTML_NS,'table')
            var tr1 = expandedHeaderTR(subject)
            table.appendChild(tr1)
            
            /*   This should be a beautiful system not a quick kludge - timbl 
            **   Put  link to inferenceWeb browsers for anything which is a proof
            */  
            var classes = kb.each(subject, rdf('type'))
            var i=0, n=classes.length;
            for (i=0; i<n; i++) {
                if (classes[i].uri == 'http://inferenceweb.stanford.edu/2004/07/iw.owl#NodeSet') {
                    var anchor = myDocument.createElementNS(HTML_NS,'a');
                    anchor.setAttribute('href', "http://silo.stanford.edu/iwbrowser/NodeSetBrowser?url=" + encodeURIComponent(subject.uri)); // @@ encode
                    anchor.setAttribute('title', "Browse in Infereence Web");
                    anchor.appendChild(AJARImage(
                        'http://iw.stanford.edu/2.0/images/iw-logo-icon.png', 'IW', 'Inference Web'));
                    tr1.appendChild(anchor)
                }
            }
            
//            table.appendChild(defaultPane.render(subject));
            if (tr1.firstPane) {
                var paneDiv = tr1.firstPane.render(subject,myDocument);
                table.appendChild(paneDiv);
                paneDiv.pane = tr1.firstPane;
            }
            
            return table
            
        } else {  // New display of existing table, keeping expanded bits
        
            tabulator.log.info('Re-expand: '+table)
            try{table.replaceChild(expandedHeaderTR(subject),table.firstChild)}
            catch(e){}   // kludge... Todo: remove this (seeAlso UserInput::clearInputAndSave)
            var row, s
            var expandedNodes = {}
    
            for (row = table.firstChild; row; row = row.nextSibling) { // Note which p,o pairs are exppanded
                if (row.childNodes[1]
                    && row.childNodes[1].firstChild.nodeName == 'TABLE') {
                    s = row.AJAR_statement
                    if (!expandedNodes[s.predicate.toString()]) {
                        expandedNodes[s.predicate.toString()] = {}
                    }
                    expandedNodes[s.predicate.toString()][s.object.toString()] =
                        row.childNodes[1].childNodes[1]
                }
            }
    
            table = propertyTable(subject, undefined, pane)  // Re-build table
    
            for (row = table.firstChild; row; row = row.nextSibling) {
                s = row.AJAR_statement
                if (s) {
                    if (expandedNodes[s.predicate.toString()]) {
                        var node =
                            expandedNodes[s.predicate.toString()][s.object.toString()]
                        if (node) {
                            row.childNodes[1].replaceChild(node,
                                            row.childNodes[1].firstChild)
                        }
                    }
                }
            }
    
            // do some other stuff here
            return table
        }
    } /* propertyTable */
    
    ///////////// Property list 
    function appendPropertyTRs(parent, plist, inverse, predicateFilter) {
        tabulator.log.info("@appendPropertyTRs, myDocument is now " + this.document.location);
        tabulator.log.info("@appendPropertyTRs, myDocument is now " + thisOutline.document.location);            
        tabulator.log.debug("Property list length = " + plist.length)
        if (plist.length == 0) return "";
        var sel
        if (inverse) {
            sel = function(x) {return x.subject}
            plist = plist.sort(RDFComparePredicateSubject)
        } else {
            sel = function(x){return x.object}
            plist = plist.sort(RDFComparePredicateObject)
        }
        var j
        var max = plist.length
        for (j=0; j<max; j++) { //squishing together equivalent properties I think
            var s = plist[j]
        //      if (s.object == parentSubject) continue; // that we knew
        
            // Avoid predicates from other panes
            if (!predicateFilter(s.predicate, inverse)) continue;
            /*
            var internal = (typeof internalPane.predicates[''+s.predicate.uri] != 'undefined')
            if ((!details && internal) || (details && !internal)) { // exclusive-or only in JS 2.0
                continue;
            }
            if (inverse && (s.predicate.uri == 
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")) continue; 
            */
            var k;
            var dups = 0; // How many rows have the same predicate, -1?
            var langTagged = 0;  // how many objects have language tags?
            var myLang = 0; // Is there one I like?
            for (k=0; (k+j < max) && (plist[j+k].predicate.sameTerm(s.predicate)); k++) {
                if (k>0 && (sel(plist[j+k]).sameTerm(sel(plist[j+k-1])))) dups++;
                if (sel(plist[j+k]).lang) {
                    langTagged +=1;
                    if (sel(plist[j+k]).lang.indexOf(LanguagePreference) >=0) myLang ++; 
                }
            }
    
            
            var tr = myDocument.createElementNS(HTML_NS,"tr")
            parent.appendChild(tr)
            tr.AJAR_statement = s
            tr.AJAR_inverse = inverse
            tr.AJAR_variable  // @@ ??
            tr.setAttribute('predTR','true')
            var td_p = thisOutline.outline_predicateTD(s.predicate, tr, inverse);
            tr.appendChild(td_p) // @@ add "internal" to td_p's class for style? mno

            var defaultpropview = views.defaults[s.predicate.uri];
            
            /* Display only the one in the preferred language 
              ONLY in the case (currently) when all the values are tagged.
              Then we treat them as alternatives.*/
            
            if (myLang > 0 && langTagged == dups+1) {
                for (k=j; k <= j+dups; k++) {
                    if (sel(plist[k]).lang.indexOf(LanguagePreference) >=0) {
                        tr.appendChild(thisOutline.outline_objectTD(sel(plist[k]), defaultpropview, undefined, s.why))
                        break;
                    }
                }
                j += dups  // extra push
                continue;
            }
    
            tr.appendChild(thisOutline.outline_objectTD(sel(s), defaultpropview, undefined, s.why));
    
            /* Note: showNobj shows between n to 2n objects.
             * This is to prevent the case where you have a long list of objects
             * shown, and dangling at the end is '1 more' (which is easily ignored)
             * Therefore more objects are shown than hidden.
             */
             
            tr.showNobj = function(n){
                var predDups=k-dups;
                var show = ((2*n)<predDups) ? n: predDups;
                var showLaterArray=[];
                if (predDups!=1){
                    td_p.setAttribute('rowspan',(show==predDups)?predDups:n+1);
                    var l;
                    if ((show<predDups)&&(show==1)){ //what case is this...
                        td_p.setAttribute('rowspan',2)  
                    }
                    for(l=1;l<k;l++){
                        if (!kb.canon(sel(plist[j+l])).sameTerm(kb.canon(sel(plist[j+l-1])))){
                            s=plist[j+l];
                            defaultpropview = views.defaults[s.predicate.uri];
                            var trObj=myDocument.createElementNS(HTML_NS,'tr');
                            trObj.style.colspan='1';
                            trObj.appendChild(thisOutline.outline_objectTD(
                                sel(plist[j+l]),defaultpropview, undefined, s.why));
                            trObj.AJAR_statement=s;
                            trObj.AJAR_inverse=inverse;
                            parent.appendChild(trObj);
                            if (l>=show){
                                trObj.style.display='none';
                                showLaterArray.push(trObj);
                            }
                        }
                    }
                } // if

                if (show<predDups){ //Add the x more <TR> here
                    var moreTR=myDocument.createElementNS(HTML_NS,'tr');
                    var moreTD=moreTR.appendChild(myDocument.createElementNS(HTML_NS,'td'));
                    if (predDups>n){ //what is this for??
                        var small=myDocument.createElementNS(HTML_NS,'a');
                        moreTD.appendChild(small);

                        var predToggle= (function(f){return f(td_p,k,dups,n);})(function(td_p,k,dups,n){
                        return function(display){
                            small.innerHTML="";
                            if (display=='none'){
                                small.appendChild(AJARImage(Icon.src.icon_more, 'more', 'See all'));
                                    small.appendChild( myDocument.createTextNode((predDups-n) + ' more...'));
                                td_p.setAttribute('rowspan',n+1);
                            } else{
                                    small.appendChild(AJARImage(Icon.src.icon_shrink, '(less)'));
                                    td_p.setAttribute('rowspan',predDups+1);
                            }
                            for (var i=0; i<showLaterArray.length; i++){
                                var trObj = showLaterArray[i];
                                trObj.style.display = display;
                            }
                        }
                            }); //???
                            var current='none';
                        var toggleObj=function(event){
                            predToggle(current);
                            current=(current=='none')?'':'none';
                            if (event) event.stopPropagation();
                            return false; //what is this for?
                        }
                        toggleObj();
                        small.addEventListener('click', toggleObj, false); 
                        } //if(predDups>n)
                        parent.appendChild(moreTR);
                } // if
            } // tr.showNobj
    
            tr.showAllobj = function(){tr.showNobj(k-dups);};
            //tr.showAllobj();
            /*DisplayOptions["display:block on"].setupHere(
                    [tr,j,k,dups,td_p,plist,sel,inverse,parent,myDocument,thisOutline],
                    "appendPropertyTRs()");*/ 
            tr.showNobj(10);
            
            if (HCIoptions["bottom insert highlights"].enabled){
                var holdingTr=myDocument.createElementNS(HTML_NS,'tr');
                var holdingTd=myDocument.createElementNS(HTML_NS,'td');
                holdingTd.setAttribute('colspan','2');
                var bottomDiv=myDocument.createElementNS(HTML_NS,'div');
                bottomDiv.className='bottom-border';
                holdingTd.setAttribute('notSelectable','true');
                bottomDiv.addEventListener('mouseover',thisOutline.UserInput.Mouseover,false);
                bottomDiv.addEventListener('mouseout',thisOutline.UserInput.Mouseout,false);
                bottomDiv.addEventListener('click',thisOutline.UserInput.borderClick,false);
                parent.appendChild(holdingTr).appendChild(holdingTd).appendChild(bottomDiv);
            }
        
            j += k-1  // extra push
        }
    } //  appendPropertyTRs


/*   termWidget
**
*/  
    termWidget={}
    termWidget.construct = function () {
        td = myDocument.createElementNS(HTML_NS,'td')
        td.setAttribute('class','iconTD')
        td.setAttribute('notSelectable','true')
        td.style.width = '0px';
        return td
    }
    termWidget.addIcon = function (td, icon) {
        var img = AJARImage(icon.src,icon.alt,icon.tooltip)
        var iconTD = td.childNodes[1];
        var width = iconTD.style.width;
        width = parseInt(width);
        width = width + icon.width;
        iconTD.style.width = width+'px';
        iconTD.appendChild(img);
    }
    termWidget.removeIcon = function (td, icon) {
        var iconTD = td.childNodes[1];
        var width = iconTD.style.width;
        width = parseInt(width);
        width = width - icon.width;
        iconTD.style.width = width+'px';
        for (var x = 0; x<iconTD.childNodes.length; x++){
            var elt = iconTD.childNodes[x];
            var eltSrc = elt.src;
            
            // ignore first '?' and everything after it //Kenny doesn't know what this is for
            try{var baseURI = myDocument.location.href.split('?')[0];}
            catch(e){ dump(e);var baseURI="";}
            var relativeIconSrc = Util.uri.join(icon.src,baseURI);
            if (eltSrc == relativeIconSrc) {
                iconTD.removeChild(elt);
            }
        }
    }
    termWidget.replaceIcon = function (td, oldIcon, newIcon) {
            termWidget.removeIcon (td, oldIcon)
            termWidget.addIcon (td, newIcon)
    }   
    
    
    
    ////////////////////////////////////////////////////// VALUE BROWSER VIEW

    ////////////////////////////////////////////////////////// TABLE VIEW

    //  Summarize a thing as a table cell

    /**********************
    
      query global vars 
    
    ***********************/
    
    // const doesn't work in Opera
    // const BLANK_QUERY = { pat: kb.formula(), vars: [], orderBy: [] };
    // @ pat: the query pattern in an RDFIndexedFormula. Statements are in pat.statements
    // @ vars: the free variables in the query
    // @ orderBy: the variables to order the table

    function queryObj() { 
            this.pat = kb.formula(), 
            this.vars = []
            this.orderBy = [] 
    }
    
    var queries = [];
    myQuery=queries[0]=new queryObj();

    function query_save() {
        queries.push(queries[0]);
        var choices = myDocument.getElementById('queryChoices');
        var next = myDocument.createElementNS(HTML_NS,'option');
        var box = myDocument.createElementNS(HTML_NS,'input');
        var index = queries.length-1;
        box.setAttribute('type','checkBox');
        box.setAttribute('value',index);
        choices.appendChild(box);
        choices.appendChild(myDocument.createTextNode("Saved query #"+index));
        choices.appendChild(myDocument.createElementNS(HTML_NS,'br'));
            next.setAttribute("value",index);
            next.appendChild(myDocument.createTextNode("Saved query #"+index));
            myDocument.getElementById("queryJump").appendChild(next);
      }


    function resetQuery() {
            function resetOutliner(pat)
            {
            var i, n = pat.statements.length, pattern, tr;
            for (i=0; i<n; i++) {
                    pattern = pat.statements[i];
                    tr = pattern.tr;
                    //tabulator.log.debug("tr: " + tr.AJAR_statement);
                    if (typeof tr!='undefined')
                    {
                            delete tr.AJAR_pattern;
                            delete tr.AJAR_variable;
                    }
            }
            for (x in pat.optional)
                    resetOutliner(pat.optional[x])
        }
        resetOutliner(myQuery.pat)
        clearVariableNames();
        queries[0]=myQuery=new queryObj();
    }

    function AJAR_ClearTable() {
        resetQuery();
        var div = myDocument.getElementById('results');
        emptyNode(div);
        return false;
    } //AJAR_ClearTable
    
    function addButtonCallbacks(target, term) {
        var fireOn = Util.uri.docpart(term.uri)
        tabulator.log.debug("Button callbacks for " + fireOn + " added")
        var makeIconCallback = function (icon) {
            return function IconCallback(req) {
                if (req.indexOf('#') >= 0) alert('Should have no hash in '+req)
                if (!target) {
                    return false
                }          
                if (!outline.ancestor(target,'div')) return false;
                if (term.termType != "symbol") { return true }
                if (req == fireOn) {
                    target.src = icon
                    target.title = Icon.tooltips[icon]
                }
                return true
            }
        }
        sf.addCallback('request',makeIconCallback(Icon.src.icon_requested))
        sf.addCallback('done',makeIconCallback(Icon.src.icon_fetched))
        sf.addCallback('fail',makeIconCallback(Icon.src.icon_failed))
    }
    
    //   Selection support
    
    function selected(node) {
        var a = node.getAttribute('class')
        if (a && (a.indexOf('selected') >= 0)) return true
        return false
    }

    function setSelectedParent(node, inc) {
        var onIcon = Icon.termWidgets.optOn;
            var offIcon = Icon.termWidgets.optOff;
            for (var n = node; n.parentNode; n=n.parentNode)
            {
            while (true)
            {
                if (n.getAttribute('predTR'))
                {
                    var num = n.getAttribute('parentOfSelected')
                    if (!num) num = 0;
                    else num = parseInt(num);
                    if (num==0 && inc>0) termWidget.addIcon(n.childNodes[0],n.getAttribute('optional')?onIcon:offIcon)
                    num = num+inc;
                    n.setAttribute('parentOfSelected',num)
                    if (num==0) 
                    {
                        n.removeAttribute('parentOfSelected')
                        termWidget.removeIcon(n.childNodes[0],n.getAttribute('optional')?onIcon:offIcon)
                    }
                    break;
                }
                else if (n.previousSibling && n.previousSibling.nodeName == 'tr')
                    n=n.previousSibling;
                else break;
            }
        }
    }
    this.showURI = function showURI(about){
        if(about && myDocument.getElementById('UserURI')) { 
             myDocument.getElementById('UserURI').value = 
                  (about.termType == 'symbol') ? about.uri : ''; // blank if no URI
         } else if(about && isExtension) {
             var tabStatusBar = gBrowser.ownerDocument.getElementById("tabulator-display");
             tabStatusBar.setAttribute('style','display:block');
             tabStatusBar.label = (about.termType == 'symbol') ? about.uri : ''; // blank if no URI
             if(tabStatusBar.label=="") {
                 tabStatusBar.setAttribute('style','display:none');
             }
         }    
    };
    
    function setSelected(node, newValue) {
        tabulator.log.info("selection has " +selection.map(function(item){return item.textContent;}).join(", "));
        tabulator.log.debug("@outline setSelected, intended to "+(newValue?"select ":"deselect ")+node+node.textContent);   
        //if (newValue == selected(node)) return; //we might not need this anymore...
        if (node.nodeName != 'td') {tabulator.log.debug('down'+node.nodeName);throw 'Expected td in setSelected: '+node.nodeName+node.textContent;}
        tabulator.log.debug('pass');
        var cla = node.getAttribute('class')
        if (!cla) cla = ""
        if (newValue) {
            cla += ' selected'
            if (cla.indexOf('pred') >= 0 || cla.indexOf('obj') >=0 ) setSelectedParent(node,1)
            selection.push(node)
            //tabulator.log.info("Selecting "+node.textContent)

            var about=getTerm(node); //show uri for a newly selectedTd
            thisOutline.showURI(about);
            if(isExtension && about && about.termType=='symbol') gURLBar.value = about.uri;
                           //about==null when node is a TBD
                         
            var st = node.AJAR_statement; //show blue cross when the why of that triple is editable
            if (typeof st == 'undefined') st = node.parentNode.AJAR_statement;
            //if (typeof st == 'undefined') return; // @@ Kludge?  Click in the middle of nowhere
            if (st) { //don't do these for headers or base nodes
            var source = st.why;
            var target = st.why;
            var editable = outline.sparql.prototype.editable(target.uri, kb);
            if (!editable)
                target = node.parentNode.AJAR_inverse ? st.object : st.subject; // left hand side
                editable = outline.sparql.prototype.editable(target.uri, kb);
            // alert('Target='+target+', editable='+editable+'\nselected statement:' + st)
            if (editable && (cla.indexOf('pred') >= 0))
                termWidget.addIcon(node,Icon.termWidgets.addTri); // Add blue plus
            }
            
/*       was:     var source;
            try{node.parentNode.AJAR_statement}catch(e){alert('setSelected: '+node.textContent)}
            if (node.AJAR_statement) source = node.AJAR_statement.why
            else if (node.parentNode.AJAR_statement) source = node.parentNode.AJAR_statement.why
 */
                       //tabulator.log.info('Source to highlight: '+source);
            if (source && source.uri && sourceWidget) sourceWidget.highlight(source, true);
        } else {
            tabulator.log.debug("cla=$"+cla+"$")
            if (cla=='selected') cla=''; // for header <td>
            cla = cla.replace(' selected','')
            if (cla.indexOf('pred') >= 0 || cla.indexOf('obj') >=0 ) setSelectedParent(node,-1)
            if (cla.indexOf('pred') >=0)
                termWidget.removeIcon(node,Icon.termWidgets.addTri);
            RDFArrayRemove(selection, node)
            tabulator.log.info("Deselecting "+node.textContent);
            tabulator.log.debug("cla=$"+cla+"$");
            if (node.AJAR_statement) source=node.AJAR_statement.why;
            else if (node.parentNode.AJAR_statement) source=node.parentNode.AJAR_statement.why;
            if (source && source.uri && sourceWidget) sourceWidget.highlight(source, false);
        }
        tabulator.log.info("selection becomes " +selection.map(function(item){return item.textContent;}).join(", "));
        //tabulator.log.info("Setting className " + cla);
        node.setAttribute('class', cla)
    }

    function deselectAll() {
        var i, n=selection.length
        for (i=n-1; i>=0; i--) setSelected(selection[i], false);
    }
    /////////  Hiding

    this.AJAR_hideNext = function(event) {
        var target = getTarget(event)
        var div = target.parentNode.nextSibling
        for (; div.nodeType != 1; div = div.nextSibling) {}
        if (target.src.indexOf('collapse') >= 0) {
            div.setAttribute('class', 'collapse')
            target.src = Icon.src.icon_expand
        } else {
            div.removeAttribute('class')
            target.scrollIntoView(true)
            target.src = Icon.src.icon_collapse
        }
    }

    this.TabulatorDoubleClick =function(event) {
        var target = getTarget(event);
        var tname = target.tagName;
        tabulator.log.debug("TabulatorDoubleClick: " + tname + " in "+target.parentNode.tagName);
        if (tname == "IMG") return; // icons only click once, panes toggle on second click
        var aa = getAbout(kb, target);
        if (!aa) return;
            this.GotoSubject(aa,true);
    }

    function ResultsDoubleClick(event) {    
        var target = getTarget(event);
        var aa = getAbout(kb, target)
        if (!aa) return;
        this.GotoSubject(aa,true);
    }

    function setCookie(name, value, expires, path, domain, secure) {
        expires = new Date(); // http://www.w3schools.com/jsref/jsref_obj_date.asp
        expires.setFullYear("2030"); // How does one say never?
        var curCookie = name + "=" + escape(value) +
            ((expires) ? "; expires=" + expires.toGMTString() : "") +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            ((secure) ? "; secure" : "");
        myDocument.cookie = curCookie;
//        alert('Cookie:' + curCookie);
    }
    
    /*  getCookie
    **
    **  name - name of the desired cookie
    **  return string containing value of specified cookie or null
    **  if cookie does not exist
    */
    function getCookie(name) {
        var dc = myDocument.cookie;
        var prefix = name + "=";
        var begin = dc.indexOf("; " + prefix);
        if (begin == -1) {
            begin = dc.indexOf(prefix);
            if (begin != 0) return null;
        } else
            begin += 2;
        var end = myDocument.cookie.indexOf(";", begin);
        if (end == -1)
            end = dc.length;
        return decodeURIComponent(dc.substring(begin + prefix.length, end));
    }
    function deleteCookie(name, path, domain) {
        if (getCookie(name)) {
            myDocument.cookie = name + "=" +
                ((path) ? "; path=" + path : "") +
                ((domain) ? "; domain=" + domain : "") +
                "; expires=Thu, 01-Jan-70 00:00:01 GMT";
        }
    }

    /** get the target of an event **/  
    this.targetOf=function(e) {
        var target;
        if (!e) var e = window.event
        if (e.target) 
            target = e.target
        else if (e.srcElement) 
        target = e.srcElement
        else {
            tabulator.log.error("can't get target for event " + e);
            return false;
        } //fail
        if (target.nodeType == 3) // defeat Safari bug [sic]
            target = target.parentNode;
        return target;
    } //targetOf


    this.walk = function walk(directionCode,inputTd){
         var selectedTd=inputTd||selection[0];
         var newSelTd;
         switch (directionCode){
             case 'down':
                 try{newSelTd=selectedTd.parentNode.nextSibling.lastChild;}catch(e){
                     this.walk('up');
                     return;
                 }//end
                 deselectAll();
                 setSelected(newSelTd,true);
                 break;
             case 'up':
                 try{newSelTd=selectedTd.parentNode.previousSibling.lastChild;}catch(e){return;}//top
                 deselectAll();
                 setSelected(newSelTd,true);
                 break;
             case 'right':
                 deselectAll();
                 if (selectedTd.nextSibling||selectedTd.lastChild.tagName=='strong')
                     setSelected(selectedTd.nextSibling,true);
                 else{
                     var newSelected=myDocument.evaluate('table/div/tr/td[2]',selectedTd,
                                                        null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
                     setSelected(newSelected,true);
                 }
                 break;
             case 'left':
                 deselectAll();
                 if (selectedTd.previousSibling && selectedTd.previousSibling.className=='undetermined'){
                     setSelected(selectedTd.previousSibling,true);
                     return true; //do not shrink signal
                 }
                 else
                     setSelected(ancestor(selectedTd.parentNode,'td'),true); //supplied by thieOutline.focusTd
                 break;
             case 'moveTo':
                 //tabulator.log.info(selection[0].textContent+"->"+inputTd.textContent);
                 deselectAll();
                 setSelected(inputTd,true);
                 break;          
         }
         if (directionCode=='down'||directionCode=='up') 
             if (!newSelTd.tabulatorSelect) this.walk(directionCode);
         //return newSelTd;
    }
    //Keyboard Input: we can consider this as...
    //1. a fast way to modify data - enter will go to next predicate
    //2. an alternative way to input - enter at the end of a predicate will create a new statement
    this.OutlinerKeypressPanel=function OutlinerKeypressPanel(e){
        tabulator.log.info("Key "+e.keyCode+" pressed");
        function showURI(about){
            if(about && myDocument.getElementById('UserURI')) { 
                    myDocument.getElementById('UserURI').value = 
                         (about.termType == 'symbol') ? about.uri : ''; // blank if no URI
            }
        }

        if (getTarget(e).tagName=='textarea') return;
            if (getTarget(e).id=="UserURI") return;
            if (selection.length>1) return;
            if (selection.length==0){
                if (e.keyCode==13||e.keyCode==38||e.keyCode==40||e.keyCode==37||e.keyCode==39){
                    this.walk('right',thisOutline.focusTd);
                    showURI(getAbout(kb,selection[0]));            
                }    
                return;    
        }
        var selectedTd=selection[0];
        //if not done, Have to deal with redraw...
        sf.removeCallback('done',"setSelectedAfterward");
        sf.removeCallback('fail',"setSelectedAfterward");
        
        switch (e.keyCode){
            case 13://enter
                if (getTarget(e).tagName=='HTML'){ //I don't know why 'HTML'                   
                    var object=getAbout(kb,selectedTd);
                    var target = selectedTd.parentNode.AJAR_statement.why;
                    var editable = outline.sparql.prototype.editable(target.uri, kb);                    
                    if (object){
                        //<Feature about="enterToExpand"> 
                        outline.GotoSubject(object,true);
                        /* //deal with this later 
                        deselectAll();
                        var newTr=myDocument.getElementById('outline').lastChild;                
                        setSelected(newTr.firstChild.firstChild.childNodes[1].lastChild,true);
                        function setSelectedAfterward(uri){
                            deselectAll();
                            setSelected(newTr.firstChild.firstChild.childNodes[1].lastChild,true);
                            showURI(getAbout(kb,selection[0]));
                            return true;                        
                        }
                        sf.insertCallback('done',setSelectedAfterward);
                        sf.insertCallback('fail',setSelectedAfterward);
                        */
                        //</Feature>                                                   
                    } else if (editable) {//this is a text node and editable
                        thisOutline.UserInput.Enter(selectedTd);
                    }
                
                }else{
                //var newSelTd=thisOutline.UserInput.lastModified.parentNode.parentNode.nextSibling.lastChild;
                this.UserInput.Keypress(e);
                var notEnd=this.walk('down');//bug with input at the end
                //myDocument.getElementById('docHTML').focus(); //have to set this or focus blurs
                e.stopPropagation();
                }
                return;      
            case 38://up
                //thisOutline.UserInput.clearInputAndSave(); 
                //^^^ does not work because up and down not captured...
                this.walk('up');
                e.stopPropagation();
                e.preventDefault();
                break;
            case 40://down
                //thisOutline.UserInput.clearInputAndSave();
                this.walk('down');
                e.stopPropagation();
                e.preventDefault();
        } // switch
        
        if (getTarget(e).tagName=='input'||getTarget(e).tagName=='xul:textbox') return;
        
        switch (e.keyCode){
            case 46://delete
            case 8://backspace
                var target = selectedTd.parentNode.AJAR_statement.why;
                var editable = outline.sparql.prototype.editable(target.uri, kb);
                if (editable){                                
                    e.preventDefault();//prevent from going back
                    this.UserInput.Delete(selectedTd);
                }
                break;
            case 37://left
                if (this.walk('left')) return;
                var titleTd=ancestor(selectedTd.parentNode,'td');
                outline_collapse(selectedTd,getAbout(kb,titleTd));
                break;
            case 39://right
                var obj=getAbout(kb,selectedTd);
                if (obj){
                    var walk=this.walk;
                    function setSelectedAfterward(uri){
                        if (arguments[3]) return true;
                        walk('right',selectedTd);
                        showURI(getAbout(kb,selection[0]));
                        return true;
                    }
                    if (selectedTd.nextSibling) { //when selectedTd is a predicate
                        this.walk('right');
                        return;
                    }
                    if (selectedTd.firstChild.tagName!='TABLE'){//not expanded
                        sf.addCallback('done',setSelectedAfterward);
                        sf.addCallback('fail',setSelectedAfterward);
                        outline_expand(selectedTd, obj, defaultPane);
                    }
                    setSelectedAfterward();                   
                }
                break;
            case 38://up
            case 40://down
                break;    
            default:
                switch(e.charCode){
                    case 99: //c for Copy
                        if (e.ctrlKey){
                            thisOutline.UserInput.copyToClipboard(thisOutline.clipboardAddress,selectedTd);
                        break;
                        }
                    case 118: //v
                    case 112: //p for Paste
                        if (e.ctrlKey){
                            thisOutline.UserInput.pasteFromClipboard(thisOutline.clipboardAddress,selectedTd);
                            //myDocument.getElementById('docHTML').focus(); //have to set this or focus blurs
                            //window.focus();
                            //e.stopPropagation();                   
                            break;
                        }
                    default:
                    if (getTarget(e).tagName=='HTML'){
                    /*
                    //<Feature about="typeOnSelectedToInput">
                    thisOutline.UserInput.Click(e,selectedTd);
                    thisOutline.UserInput.lastModified.value=String.fromCharCode(e.charCode);
                    if (selectedTd.className=='undetermined selected') thisOutline.UserInput.AutoComplete(e.charCode)
                    //</Feature>
                    */
                    //Events are not reliable...
                    //var e2=document.createEvent("KeyboardEvent");
                    //e2.initKeyEvent("keypress",true,true,null,false,false,false,false,e.keyCode,0);
                    //UserInput.lastModified.dispatchEvent(e2);
                }
            }
        }//end of switch

    showURI(getAbout(kb,selection[0]));
    //alert(window);alert(doc);
    /*
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
               .getService(Components.interfaces.nsIWindowMediator);
    var gBrowser = wm.getMostRecentWindow("navigator:browser")*/
    //gBrowser.addTab("http://www.w3.org/");
    //alert(gBrowser.addTab);alert(gBrowser.scroll);alert(gBrowser.scrollBy)
    //gBrowser.scrollBy(0,100);
    
    //var thisHtml=selection[0].owner
    if (selection[0]){   
            var PosY=findPos(selection[0])[1];
            if (PosY+selection[0].clientHeight > window.scrollY+window.innerHeight) getEyeFocus(selection[0],true,true);
            if (PosY<window.scrollY+54) getEyeFocus(selection[0],true);
        }
    };
    this.OutlinerMouseclickPanel=function(e){
        switch(thisOutline.UserInput._tabulatorMode){
            case 0:
                TabulatorMousedown(e);
                break;
            case 1:
                thisOutline.UserInput.Click(e);
                break;
            default:
        }
    }

    /** things to do onmousedown in outline view **/
    // expand
    // collapse
    // refocus
    // select
    // visit/open a page    
    function TabulatorMousedown(e) {
        tabulator.log.info("@TabulatorMousedown, myDocument is now " + myDocument.location);
        var target = thisOutline.targetOf(e);
        if (!target) return;
        var tname = target.tagName;
        //tabulator.log.debug("TabulatorMousedown: " + tname + " shift="+e.shiftKey+" alt="+e.altKey+" ctrl="+e.ctrlKey);
        var p = target.parentNode;
        var about = getAbout(kb, target)
        var source = null;
        if (tname == "input" || tname == "textarea") {
            return
        }
        //not input then clear
        thisOutline.UserInput.clearMenu();
        //ToDo:remove this and recover X
        if (thisOutline.UserInput.lastModified&&
            thisOutline.UserInput.lastModified.parentNode.nextSibling) thisOutline.UserInput.backOut();
        if (tname != "img") {
            /*
            if(about && myDocument.getElementById('UserURI')) { 
                myDocument.getElementById('UserURI').value = 
                     (about.termType == 'symbol') ? about.uri : ''; // blank if no URI
            } else if(about && isExtension) {
                var tabStatusBar = gBrowser.ownerDocument.getElementById("tabulator-display");
                tabStatusBar.setAttribute('style','display:block');
                tabStatusBar.label = (about.termType == 'symbol') ? about.uri : ''; // blank if no URI
                if(tabStatusBar.label=="") {
                    tabStatusBar.setAttribute('style','display:none');
                }
            }
            */
            var node;
            for (node = ancestor(target, 'td');
                 node && node.getAttribute('notSelectable');
                 node = ancestor(node.parentNode, 'td')) {}
            if (!node) return;
            var sel = selected(node);
            var cla = node.getAttribute('class')
            tabulator.log.debug("Was node selected before: "+sel)
            if (e.altKey) {
                setSelected(node, !selected(node))
            } else if  (e.shiftKey) {
                setSelected(node, true)
            } else {
                //setSelected(node, !selected(node))
                deselectAll()
                thisOutline.UserInput.clearInputAndSave(e);   
                setSelected(node, true)
                
                if (e.detail==2){//dobule click -> quit TabulatorMousedown()
                    e.stopPropagation();
                    return;
                }
                //if the node is already selected and the correspoding statement is editable,
                //go to UserInput
                
                var target = node.parentNode.AJAR_statement.why;
                var editable = outline.sparql.prototype.editable(target.uri, kb);
                var text="TabulatorMouseDown@Outline()";
                if (sel&editable) thisOutline.UserInput.Click(e, selection[0]); // was next line
                // HCIoptions["able to edit in Discovery Mode by mouse"].setupHere([sel,e,thisOutline,selection[0]],text); 
            }
            tabulator.log.debug("Was node selected after: "+selected(node)
                +", count="+selection.length)
                var tr = node.parentNode;
                if (tr.AJAR_statement) {
                    var why = tr.AJAR_statement.why
                    //tabulator.log.info("Information from "+why);
                }
            e.stopPropagation();
            return; //this is important or conflict between deslect and userinput happens
        } else { // IMG
            var tsrc = target.src
            var outer
            var i = tsrc.indexOf('/icons/')
            //TODO: This check could definitely be made cleaner.
            if (i >=0 && tsrc.search('chrome://tabulator/content/icons')==-1) tsrc=tsrc.slice(i+1) // get just relative bit we use
            tabulator.log.debug("\nEvent: You clicked on an image, src=" + tsrc)
            if (!about && tsrc!=Icon.src.icon_add_new_triple) {
                //alert("No about attribute");
                return;
            }
            var subject = about;
            tabulator.log.debug("TabulatorMousedown: subject=" + subject);
            
            switch (tsrc) {
            case Icon.src.icon_expand:
            case Icon.src.icon_collapse:
                var pane = e.altKey? internalPane : defaultPane;
                var mode = e.shiftKey ? outline_refocus :
                    (tsrc == Icon.src.icon_expand ? outline_expand : outline_collapse);
                mode(p, subject, pane);
                break;
                //  case Icon.src.icon_visit:
                //emptyNode(p.parentNode).appendChild(documentContentTABLE(subject));
                //document.url = subject.uri;   // How to jump to new page?
                //var newWin = window.open(''+subject.uri,''+subject.uri,'width=500,height=500,resizable=1,scrollbars=1');
                //newWin.focus();
                //break;
            case Icon.src.icon_failed:
            case Icon.src.icon_fetched:
                sf.objectRefresh(subject);
                break;
            case Icon.src.icon_unrequested:
                if (subject.uri) sf.lookUpThing(subject);
                break;
            case Icon.src.icon_opton:
            case Icon.src.icon_optoff:
                oldIcon = (tsrc==Icon.src.icon_opton)? Icon.termWidgets.optOn : Icon.termWidgets.optOff;
                newIcon = (tsrc==Icon.src.icon_opton)? Icon.termWidgets.optOff : Icon.termWidgets.optOn;
                termWidget.replaceIcon(p.parentNode,oldIcon,newIcon);
                if (tsrc==Icon.src.icon_opton)
                    p.parentNode.parentNode.removeAttribute('optional');
                else p.parentNode.parentNode.setAttribute('optional','true');
                break;
            case Icon.src.icon_remove_node:
                var node = target.node;
                if (node.childNodes.length>1) node=target.parentNode; //parallel outline view @@ Hack
                removeAndRefresh(node); // @@ update icons for pane?
                
                break;
            case Icon.src.icon_map:
                var node = target.node;
                    setSelected(node, true);
                    viewAndSaveQuery();
                break;
            case Icon.src.icon_add_triple:
                var returnSignal=thisOutline.UserInput.addTriple(e);
                if (returnSignal){ //when expand signal returned
                    outline_expand(returnSignal[0],returnSignal[1],internalPane);
                    for (var trIterator=returnSignal[0].firstChild.childNodes[1].firstChild;
                        trIterator; trIterator=trIterator.nextSibling) {
                        var st=trIterator.AJAR_statement;
                        if (!st) continue;
                        if (st.predicate.termType=='collection') break;
                    }
                    thisOutline.UserInput.Click(e,trIterator.lastChild);
                    thisOutline.walk('moveTo',trIterator.lastChild);
                }
                //thisOutline.UserInput.clearMenu();
                e.stopPropagation();
                e.preventDefault();
                return;
                break;
            case Icon.src.icon_add_new_triple:
                thisOutline.UserInput.borderClick(e);
                e.stopPropagation();
                e.preventDefault();
                return;
                break;     
            case Icon.src.icon_show_choices: // @what is this? A down-traingle like 'collapse'
                /*  SELECT ?pred 
                            WHERE{
                            about tabont:element ?pred.
                                }
                */
                // Query Error because of getAbout->kb.fromNT
                var choiceQuery=SPARQLToQuery(
                    "SELECT ?pred\nWHERE{ "+about+ tabulator.ns.link('element')+" ?pred.}");
                thisOutline.UserInput.showMenu(e,'LimitedPredicateChoice',
                    choiceQuery,{'clickedTd':p.parentNode});
                break;
                
            default:  // Look up any icons for panes
                var pane = panes.paneForIcon[tsrc];
                if (!pane) break;
                
                // Find the containing table for this subject 
                for (var t = p; t.parentNode;  t = t.parentNode) {
                    if (t.nodeName == 'table') break;
                }
                if  (t.nodeName != 'table') throw "outline: internal error"+t;

                // If the view already exists, remove it
                var state = 'paneShown';
                for (var d = t.firstChild; d; d = d.nextSibling) {
                    if (typeof d.pane != 'undefined') {
                        if (d.pane == pane) {
                            removeAndRefresh(d)
                            // If we just delete the node d, ffox doesn't refresh the display properly.
                            state = 'paneHidden';
                            break;
                        }
                    }
                }
                // If the view does not exist, create it
                if (state == 'paneShown') {
                    var paneDiv = pane.render(subject);
                    var second = t.firstChild.nextSibling;
                    if (second) t.insertBefore(paneDiv, second);
                    else t.appendChild(paneDiv);
                    paneDiv.pane = pane;
                }
                target.setAttribute('class', state) // set the button state
                // outline_expand(p, subject, internalPane, true); //  pane, already
                break;
           }
        }  // else IMG
        //if (typeof rav=='undefined') //uncommnet this for javascript2rdf
        //have to put this here or this conflicts with deselectAll()
        if (!target.src||(target.src.slice(target.src.indexOf('/icons/')+1)!=Icon.src.icon_show_choices
                       &&target.src.slice(target.src.indexOf('/icons/')+1)!=Icon.src.icon_add_triple))
            thisOutline.UserInput.clearInputAndSave(e);
        if (!target.src||target.src.slice(target.src.indexOf('/icons/')+1)!=Icon.src.icon_show_choices)        
            thisOutline.UserInput.clearMenu();
        if (e) e.stopPropagation();
    } //function
    

    function outline_expand(p, subject1, pane, already) {
        tabulator.log.info("@outline_expand, myDocument is now " + myDocument.location);
        //remove callback to prevent unexpected repaint
        sf.removeCallback('done','expand');
        sf.removeCallback('fail','expand');
        
        var subject = kb.canon(subject1)
        var requTerm = subject.uri?kb.sym(Util.uri.docpart(subject.uri)):subject
        var subj_uri = subject.uri
        var already = !!already
        
        function render() {
            subject = kb.canon(subject)
            if (!p || !p.parentNode || !p.parentNode.parentNode) return false
    
            var newTable
            tabulator.log.info('@@ REPAINTING ')
            if (!already) { // first expand
                newTable = propertyTable(subject, undefined, pane)
            } else {
                   
                tabulator.log.info(" ... p is  " + p);
                for (newTable = p.firstChild; newTable.nextSibling;
                     newTable = newTable.nextSibling) {
                    tabulator.log.info(" ... checking node "+newTable);
                    if (newTable.nodeName == 'table') break
                }
                newTable = propertyTable(subject, newTable, pane)
            }
            already = true
            if (ancestor(p, 'table') && ancestor(p, 'table').style.backgroundColor=='white') {
                newTable.style.backgroundColor='#eee'
            } else {
                newTable.style.backgroundColor='white'
            }
            try{if (YAHOO.util.Event.off) YAHOO.util.Event.off(p,'mousedown','dragMouseDown');}catch(e){dump("YAHOO")}
            emptyNode(p).appendChild(newTable)
            thisOutline.focusTd=p; //I don't know why I couldn't use 'this'...
            tabulator.log.debug("expand: Node for " + subject + " expanded")
            //fetch seeAlso when render()
            var seeAlsoStats = sf.store.statementsMatching(subject, tabulator.ns.rdfs('seeAlso'))
            seeAlsoStats.map(function (x) {sf.lookUpThing(x.object, subject,false);})
        } 
    
        function expand(uri)  {
            if (arguments[3]) return true;//already fetched indicator
            if (uri=="https://svn.csail.mit.edu/kennyluck/data") var debug=true;
            var cursubj = kb.canon(subject)  // canonical identifier may have changed
                tabulator.log.info('@@ expand: relevant subject='+cursubj+', uri='+uri+', already='+already)
            var term = kb.sym(uri)
            var docTerm = kb.sym(Util.uri.docpart(uri))
            if (uri.indexOf('#') >= 0) 
                throw "Internal error: hash in "+uri;
            
            var relevant = function() {  // Is the loading of this URI relevam to the display of subject?
                if (!cursubj.uri) return true;  // bnode should expand() 
                doc = cursubj.uri?kb.sym(Util.uri.docpart(cursubj.uri)):cursubj
                as = kb.uris(cursubj)
                if (!as) return false;
                for (var i=0; i<as.length; i++) {  // canon'l uri or any alias
                    for (var rd = Util.uri.docpart(as[i]); rd; rd = kb.HTTPRedirects[rd]) {
                        if (uri == rd) return true;
                    }
                }
                if (kb.anyStatementMatching(cursubj,undefined,undefined,docTerm)) return true; //Kenny: inverse?
                return false;
            }
            if (relevant()) {
                tabulator.log.success('@@ expand OK: relevant subject='+cursubj+', uri='+uri+', source='+
                    already)
                    
                render()
            }
            return true
        }
        // Body of outline_expand
        tabulator.log.debug("outline_expand: dereferencing "+subject)
        var status = myDocument.createElementNS(HTML_NS,"span")
        p.appendChild(status)
        sf.addCallback('done', expand)
        sf.addCallback('fail', expand)
        /*
        sf.addCallback('request', function (u) {
                           if (u != subj_uri) { return true }
                           status.textContent=" requested..."
                           return false
                       })
        sf.addCallback('recv', function (u) {
                           if (u != subj_uri) { return true }
                           status.textContent=" receiving..."
                           return false
                       })
        sf.addCallback('load', function (u) {
                           if (u != subj_uri) { return true }
                           status.textContent=" parsing..."
                           return false
                       })
        */ //these are not working as we have a pre-render();
                       
        var returnConditions=[]; //this is quite a general way to do cut and paste programming
                                 //I might make a class for this
        if (subject.uri && subject.uri.split(':')[0]=='rdf') {
            render()
            return;
        }
        SourceOptions["javascript2rdf"][1].setupHere([returnConditions],"outline_expand()");
        SourceOptions["tabulator internal terms"].setupHere([returnConditions],"outline_expand()");
        for (var i=0; i<returnConditions.length; i++){
            var returnCode;
            if (returnCode=returnConditions[i](subject)){
                render();
                if (returnCode[1]) outlineElement.removeChild(outlineElement.lastChild);
                return;
            }
        }
        sf.lookUpThing(subject);
        render()  // inital open, or else full if re-open
    
    } //outline_expand
    
    
    function outline_collapse(p, subject) {
        var row = ancestor(p, 'tr');
        row = ancestor(row.parentNode, 'tr'); //two levels up
        if (row) var statement = row.AJAR_statement;
        var level; //find level (the enclosing td)
        for (level=p.parentNode; level.tagName != "td";
                level=level.parentNode) {
            if (typeof level == 'undefined') {
                alert("Not enclosed in td!")
                return
            }
        }
                            
        tabulator.log.debug("Collapsing subject "+subject);
        var myview;
        if (statement) {
            tabulator.log.debug("looking up pred " + statement.predicate.uri + "in defaults");
            myview = views.defaults[statement.predicate.uri];
        }
        tabulator.log.debug("view= " + myview);
        if (level.parentNode.parentNode.id == 'outline') {
            var deleteNode = level.parentNode
        }
        thisOutline.replaceTD(thisOutline.outline_objectTD(subject,myview,deleteNode),level);                                                
    } //outline_collapse
    
    this.replaceTD = function replaceTD(newTd,replacedTd){
        var reselect;
        if (selected(replacedTd)) reselect=true;
        
        //deselects everything being collapsed. This goes backwards because
        //deselecting an element decreases selection.length        
        for (var x=selection.length-1;x>-1;x--)
            for (var elt=selection[x];elt.parentNode;elt=elt.parentNode)
                if (elt===replacedTd)
                    setSelected(selection[x],false)
                    
        replacedTd.parentNode.replaceChild(newTd, replacedTd);
        if (reselect) setSelected(newTd,true);                             
    }
    
    function outline_refocus(p, subject) { // Shift-expand or shift-collapse: Maximize
        if(isExtension && subject.termType != "bnode") {
            gBrowser.selectedBrowser.loadURI(subject.uri);
            return;   
        }
        var outer = null
        for (var level=p.parentNode; level; level=level.parentNode) {
            tabulator.log.debug("level "+ level.tagName)
            if (level.tagName == "td") outer = level
        } //find outermost td
        emptyNode(outer).appendChild(propertyTable(subject));
        myDocument.title = label("Tabulator: "+subject);
        outer.setAttribute('about', subject.toNT());
    } //outline_refocus
    
    // Inversion is turning the outline view inside-out
    function outline_inversion(p, subject) { // re-root at subject
    
        function move_root(rootTR, childTR) { // swap root with child
        // @@
        }
    
    }

    this.GotoFormURI_enterKey = function(e) {
        if (e.keyCode==13) outline.GotoFormURI(e);
    }
    this.GotoFormURI = function(e) {
        GotoURI(myDocument.getElementById('UserURI').value);
    }
    function GotoURI(uri) {
            var subject = kb.sym(uri)
            this.GotoSubject(subject, true);
    }
    this.GotoURIinit = function(uri){
            var subject = kb.sym(uri)
            this.GotoSubject(subject)
    }
    this.GotoSubject = function(subject, expand) {
        var table = myDocument.getElementById('outline');
        function GotoSubject_default(){
            var tr = myDocument.createElementNS(HTML_NS,"tr");
            tr.style.verticalAlign="top";
            table.appendChild(tr);
            var td = thisOutline.outline_objectTD(subject, undefined, tr)
    
            tr.appendChild(td)
            return td
        }
        var text="GotoSubject()@outline.js";
        var td=DisplayOptions["outliner rotate left"].setupHere([table,subject],text,GotoSubject_default);
        if (!td) td=GotoSubject_default(); //the first tr is required       
        if (expand) {
            outline_expand(td, subject)
            myDocument.title = label(subject)  // "Tabulator: "+  No need to advertize
            tr=td.parentNode;
            getEyeFocus(tr,false);//instantly: false
        }
        return subject;
    }
    this.GotoURIAndOpen = function(uri) {
       var sbj = GotoURI(uri);
    }

////////////////////////////////////////////////////////
//
//
//                    VIEWS
//
//
////////////////////////////////////////////////////////

    var views = {
        properties                          : [],
        defaults                                : [],
        classes                                 : []
    }; //views

    /** add a property view function **/
    function views_addPropertyView(property, pviewfunc, isDefault) {
        if (!views.properties[property]) 
            views.properties[property] = [];
        views.properties[property].push(pviewfunc);
        if(isDefault) //will override an existing default!
            views.defaults[property] = pviewfunc;
    } //addPropertyView

    var ns = tabulator.ns;
    //view that applies to items that are objects of certain properties.
    //views_addPropertyView(property, viewjsfile, default?)
    views_addPropertyView(ns.foaf('depiction').uri, VIEWAS_image, true);
    views_addPropertyView(ns.foaf('img').uri, VIEWAS_image, true);
    views_addPropertyView(ns.foaf('thumbnail').uri, VIEWAS_image, true);
    views_addPropertyView(ns.foaf('logo').uri, VIEWAS_image, true);
    //views_addPropertyView(ns.mo('image').uri, VIEWAS_image, true);
    //views_addPropertyView(ns.foaf('aimChatID').uri, VIEWAS_aim_IMme, true);
    views_addPropertyView(ns.foaf('mbox').uri, VIEWAS_mbox, true);
    //views_addPropertyView(ns.foaf('based_near').uri, VIEWAS_map, true);
    //views_addPropertyView(ns.foaf('birthday').uri, VIEWAS_cal, true);

    var thisOutline=this;
    /** some builtin simple views **/


    function statementsAsTables(sts) {
        var rep = myDocument.createElementNS(HTML_NS,'table');
        var sz = Serializer();
        var pair = sz.rootSubjects(sts);
        var roots = pair[0];
        var subjects = pair[1];

        // The property tree for a single subject or anonymos node
        function propertyTree(subject) {
            // print('Proprty tree for '+subject);
            var rep = myDocument.createElementNS(HTML_NS,'table')
            var lastPred = null;
            var sts = subjects[sz.toStr(subject)]; // relevant statements
            sts.sort();
            var same =0;
            var td_p; // The cell which holds the predicate
            for (var i=0; i<sts.length; i++) {
                var st = sts[i];
                var tr = myDocument.createElementNS(HTML_NS,'tr');
                if (st.predicate.uri != lastPred) {
                    if (lastPred && same > 1) td_p.setAttribute("rowspan", ''+same)
                    td_p = myDocument.createElementNS(HTML_NS,'td');
                    td_p.setAttribute('class', 'pred');
                    var anchor = myDocument.createElementNS(HTML_NS,'a')
                    anchor.setAttribute('href', st.predicate.uri)
                    anchor.appendChild(myDocument.createTextNode(predicateLabelForXML(st.predicate)));
                    td_p.appendChild(anchor);
                    tr.appendChild(td_p);
                    lastPred = st.predicate.uri;
                    same = 0;
                }
                same++;
                var td_o = myDocument.createElementNS(HTML_NS,'td');
                td_o.appendChild(objectTree(st.object));
                tr.appendChild(td_o);
                rep.appendChild(tr);
            }
            if (lastPred && same > 1) td_p.setAttribute("rowspan", ''+same)
            return rep;
        }

        // Convert a set of statements into a nested tree of tables
        function objectTree(obj) {
            switch(obj.termType) {
                case 'symbol':
                    var anchor = myDocument.createElementNS(HTML_NS,'a')
                    anchor.setAttribute('href', obj.uri)
                    anchor.appendChild(myDocument.createTextNode(label(obj)));
                    return anchor;
                    
                case 'literal':
                    return myDocument.createTextNode(obj.value); // placeholder
                    
                case 'bnode':
                    var newTable =  propertyTree(obj);
                    if (ancestor(newTable, 'table') && ancestor(newTable, 'table').style.backgroundColor=='white') {
                        newTable.style.backgroundColor='#eee'
                    } else {
                        newTable.style.backgroundColor='white'
                    }
                    return newTable;
                    
                case 'collection':
                    var res = myDocument.createElementNS(HTML_NS,'table')
                    res.setAttribute('class', 'collectionAsTables')
                    for (var i=0; i<obj.elements.length; i++) {
                        var tr = myDocument.createElementNS(HTML_NS,'tr');
                        res.appendChild(tr);
                        tr.appendChild(objectTree(obj.elements[i]));
                    }
                    return  res;
                case 'formula':
                    var res = statementsAsTables(obj.statements);
                    res.setAttribute('class', 'nestedFormula')
                    return res;
            }
            throw "Unhandled node type: "+obj.termType
        }

        for (var i=0; i<roots.length; i++) {
            var tr = myDocument.createElementNS(HTML_NS,'tr')
            rep.appendChild(tr);
            var td_s = myDocument.createElementNS(HTML_NS,'td')
            tr.appendChild(td_s);
            var td_tree = myDocument.createElementNS(HTML_NS,'td')
            tr.appendChild(td_tree);
            var root = roots[i];
            if (root.termType == 'bnode') {
                td_s.appendChild(myDocument.createTextNode(label(root))); // Don't recurse!
            } 
            else {
                td_s.appendChild(objectTree(root)); // won't have tree
            }
            td_tree.appendChild(propertyTree(root));
        }
        return rep;
    }
    this.statementsAsTables = statementsAsTables;
    
    
    function VIEWAS_boring_default(obj) {
        //tabulator.log.debug("entered VIEWAS_boring_default...");
        var rep; //representation in html

        if (obj.termType == 'literal')
        {
            rep = myDocument.createTextNode(obj.value);
        } else if (obj.termType == 'symbol' || obj.termType == 'bnode') {
            rep = myDocument.createElementNS(HTML_NS,'span');
            rep.setAttribute('about', obj.toNT());
            thisOutline.appendAccessIcon(rep, obj);
            if (obj.termType == 'symbol') { 
                if (obj.uri.slice(0,4) == 'tel:') {
                    var num = obj.uri.slice(4);
                    var anchor = myDocument.createElementNS(HTML_NS,'a');
                    rep.appendChild(myDocument.createTextNode(num));
                    anchor.setAttribute('href', obj.uri);
                    anchor.appendChild(AJARImage(Icon.src.icon_telephone,
                        'phone', 'phone '+num))
                    rep.appendChild(anchor);
                    anchor.firstChild.setAttribute('class', 'phoneIcon');
                } else { // not tel:
                    rep.appendChild(myDocument.createTextNode(label(obj)));
                }
            } else {  // bnode
                rep.appendChild(myDocument.createTextNode(label(obj)));
            }

  /*          
            if ((obj.termType == 'symbol') &&
                (obj.uri.indexOf("#") < 0) &&
                (Util.uri.protocol(obj.uri)=='http'
                 || Util.uri.protocol(obj.uri)=='https')) {
                // a web page @@ file, ftp;
                    var linkButton = myDocument.createElementNS(HTML_NS,'input');
                    linkButton.type='image';
                    linkButton.src='icons/document.png';
                    linkButton.alt='Open in new window';
                    linkButton.onclick= function () {
                        return window.open(''+obj.uri,
                                           ''+obj.uri,
                                           'width=500,height=500,resizable=1,scrollbars=1')
                    }  ///TODO: Reimplement this.  See humanReadablePane
                    linkButton.title='View in a new window';
                    rep.appendChild(linkButton);
    
            }
            */
        } else if (obj.termType=='collection'){
            // obj.elements is an array of the elements in the collection
            rep = myDocument.createElementNS(HTML_NS,'table');
            rep.setAttribute('about', obj.toNT());
    /* Not sure which looks best -- with or without. I think without

            var tr = rep.appendChild(document.createElementNS(HTML_NS,'tr'));
            tr.appendChild(document.createTextNode(
                    obj.elements.length ? '(' + obj.elements.length+')' : '(none)'));
    */
            for (var i=0; i<obj.elements.length; i++){
                var elt = obj.elements[i];
                var row = rep.appendChild(myDocument.createElementNS(HTML_NS,'tr'));
                var numcell = row.appendChild(myDocument.createElementNS(HTML_NS,'td'));
                numcell.setAttribute('about', obj.toNT());
                numcell.innerHTML = (i+1) + ')';
                row.appendChild(thisOutline.outline_objectTD(elt));
            }
        } else if (obj.termType=='formula'){
            // rep = myDocument.createElementNS(HTML_NS,'table');
            // rep.setAttribute('about', obj.toNT());
            // var sz = Serializer();
            // sz.suggestNamespaces(kb.namespaces);
            rep = statementsAsTables(obj.statements);
            rep.setAttribute('class', 'nestedFormula')
                        
        } else {
            tabulator.log.error("Object "+obj+" has unknown term type: " + obj.termType);
            rep = myDocument.createTextNode("[unknownTermType:" + obj.termType +"]");
        } //boring defaults.
        tabulator.log.debug("contents: "+rep.innerHTML);
        return rep;
    }  //boring_default
    
    function VIEWAS_image(obj) {
        img = AJARImage(obj.uri, label(obj), label(obj));
        img.setAttribute('class', 'outlineImage')
        return img
    }
    
    function VIEWAS_mbox(obj) {
        var anchor = myDocument.createElementNS(HTML_NS,'a');
        // previous implementation assumed email address was Literal. fixed.
        
        // FOAF mboxs must NOT be literals -- must be mailto: URIs.
        
        var address = (obj.termType=='symbol') ? obj.uri : obj.value; // this way for now
        if (!address) return VIEWAS_boring_default(obj)
        var index = address.indexOf('mailto:');
        address = (index >= 0) ? address.slice(index + 7) : address;
        anchor.setAttribute('href', 'mailto:'+address);
        anchor.appendChild(myDocument.createTextNode(address));
        return anchor;
    }
    /* need to make unique calendar containers and names
     * YAHOO.namespace(namespace) returns the namespace specified 
     * and creates it if it doesn't exist
     * function 'uni' creates a unique namespace for a calendar and 
     * returns number ending
     * ex: uni('cal') may create namespace YAHOO.cal1 and return 1
     *
     * YAHOO.namespace('foo.bar') makes YAHOO.foo.bar defined as an object,
     * which can then have properties
     */
    function uni(prefix){
        var n = counter();
        var name = prefix + n;
        YAHOO.namespace(name);
        return n;
    }
    // counter for calendar ids, 
    counter = function(){
            var n = 0;
            return function(){
                    n+=1;
                    return n;
            }
    }() // *note* those ending parens! I'm using function scope
    var renderHoliday = function(workingDate, cell) { 
            YAHOO.util.Dom.addClass(cell, "holiday");
    } 
    /* toggles whether element is displayed
     * if elt.getAttribute('display') returns null, 
     * it will be assigned 'block'
     */
    function toggle(eltname){
            var elt = myDocument.getElementById(eltname);
            elt.style.display = (elt.style.display=='none')?'block':'none'
    }
    /* Example of calendar Id: cal1
     * 42 cells in one calendar. from top left counting, each table cell has
     * ID: YAHOO.cal1_cell0 ... YAHOO.cal.1_cell41
     * name: YAHOO.cal1__2006_3_2 for anchor inside calendar cell 
     * of date 3/02/2006
     * 
     */ 
    function VIEWAS_cal(obj) {
        prefix = 'cal';
        var cal = prefix + uni(prefix);

        var containerId = cal + 'Container';
        var table = myDocument.createElementNS(HTML_NS,'table');
        
        
        // create link to hide/show calendar
        var a = myDocument.createElementNS(HTML_NS,'a');
        // a.appendChild(document.createTextNode('[toggle]'))
        a.innerHTML="<small>mm-dd: " + obj.value + "[toggle]</small>";
        //a.setAttribute('href',":toggle('"+containerId+"')");
        a.onclick = function(){toggle(containerId)};
        table.appendChild(a);

        var dateArray = obj.value.split("-");
        var m = dateArray[0];
        var d = dateArray[1];
        var yr = (dateArray.length>2)?dateArray[2]:(new Date()).getFullYear();

        // hack: calendar will be appended to divCal at first, but will
        // be moved to new location
        myDocument.getElementById('divCal').appendChild(table);
        var div = table.appendChild(myDocument.createElementNS(HTML_NS,'div'));
        div.setAttribute('id', containerId);
        // default hide calendar
        div.style.display = 'none';
        div.setAttribute('tag','calendar');
        YAHOO[cal] = new YAHOO.widget.Calendar("YAHOO." + cal, containerId, m+"/"+yr);

        YAHOO[cal].addRenderer(m+"/"+d, renderHoliday); 

        YAHOO[cal].render();
        // document.childNodes.removeChild(table);
        return table;
    }
    // test writing something to calendar cell
    function VIEWAS_aim_IMme(obj) {
        var anchor = myDocument.createElementNS(HTML_NS,'a');
        anchor.setAttribute('href', "aim:goim?screenname=" + obj.value + "&message=hello");
        anchor.setAttribute('title', "IM me!");
        anchor.appendChild(myDocument.createTextNode(obj.value));
        return anchor;
    } //aim_IMme
    this.createTabURI = function() {
        myDocument.getElementById('UserURI').value=
          myDocument.URL+"?uri="+myDocument.getElementById('UserURI').value;
    }

    doc.getElementById('main-window').addEventListener('keypress',function(e){thisOutline.OutlinerKeypressPanel.apply(thisOutline,[e])},false);
    doc.getElementById('outline').onmousedown = this.OutlinerMouseclickPanel;
    //doc.getElementById('outline').addEventListener('mousedown',thisOutline.OutlinerMouseclickPanel,false);
    //doc.getElementById('outline').onmousedown = function(e){alert(e.target)};
    //doc.getElementById('outline').addEventListener('mousedown',function(e){alert(e.originalTarget)},false);
    
    //doc.getElementById('outline').addEventListener('keypress',thisOutline.OutlinerKeypressPanel,false);
    //Kenny: I cannot make this work. The target of keypress is always <html>.
    //       I tried doc.getElementById('outline').focus();
    //doc.getElementById('outline').addEventListener('mouseover',thisOutline.UserInput.Mouseover,false);
    //doc.getElementById('outline').addEventListener('mouseout',thisOutline.UserInput.Mouseout,false);
    HCIoptions["right click to switch mode"][0].setupHere([],"end of class Outline")


    //a way to expose variables to UserInput without making them propeties/methods
    this.UserInput.setSelected=setSelected;
    this.UserInput.deselectAll=deselectAll;
    this.UserInput.views=views;
    this.outline_expand=outline_expand;
    if(isExtension) {
      window.addEventListener('unload',function() {
               var tabStatusBar = gBrowser.ownerDocument.getElementById("tabulator-display");
               tabStatusBar.label=="";
               tabStatusBar.setAttribute('style','display:none');           
      },true);

      gBrowser.mPanelContainer.addEventListener("select", function() {
               var tabStatusBar = gBrowser.ownerDocument.getElementById("tabulator-display");
               tabStatusBar.label=="";
               tabStatusBar.setAttribute('style','display:none');           
      },true);
    }

    return this;
}//END OF OUTLINE

var NextVariable = 0;
function newVariableName() {
    return 'v' + NextVariable++;
}
function clearVariableNames() { 
    NextVariable = 0;
} //clear

// ends